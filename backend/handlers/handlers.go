package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"github.com/miaoshou/backend/database"
	"github.com/miaoshou/backend/middleware"
	"github.com/miaoshou/backend/models"
	"github.com/miaoshou/backend/utils"
)

// ═══════════════════════════════════════════
// Label System Config
// ═══════════════════════════════════════════

var LabelSystem = models.LabelSystem{
	Shape: []string{"圆甲", "方圆甲", "尖甲", "梯形甲", "杏仁甲", "建构延长"},
	Tone:  []string{"裸色", "红色系", "亮色", "冷色", "金属", "魔镜粉", "透色"},
	Craft: []string{"纯色", "跳色", "渐变", "晕染", "手绘", "猫眼", "魔镜粉"},
	Decor: []string{"无装饰", "碎钻", "珍珠/铆钉", "贴纸", "立体雕花", "波点", "手绘", "金/银碎箔"},
	Style: []string{"简约风", "法式", "ins风", "甜酷风", "温柔风", "日式", "欧美风"},
}

var LabelDimensions = []models.LabelDimension{
	{Key: "shape", Name: "甲型"},
	{Key: "tone", Name: "色调"},
	{Key: "craft", Name: "工艺"},
	{Key: "decor", Name: "装饰元素"},
	{Key: "style", Name: "风格"},
}

var AppointmentStatus = map[string]map[string]string{
	"PENDING":   {"value": "pending", "label": "待确认", "color": "warning"},
	"CONFIRMED": {"value": "confirmed", "label": "已确认", "color": "primary-600"},
	"COMPLETED": {"value": "completed", "label": "已完成", "color": "success"},
	"CHANGED":   {"value": "changed", "label": "已变更", "color": "cocoa"},
	"CANCELLED": {"value": "cancelled", "label": "已取消", "color": "error"},
}

// ═══════════════════════════════════════════
// Auth Handlers
// ═══════════════════════════════════════════

type LoginReq struct {
	Phone string `json:"phone" binding:"required"`
	Code  string `json:"code" binding:"required"`
}

func SendCode(c *gin.Context) {
	var req struct{ Phone string `json:"phone" binding:"required"` }
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "手机号不能为空")
		return
	}
	utils.Success(c, gin.H{"code": "000000", "message": "验证码已发送（演示模式：000000）"})
}

func Login(c *gin.Context) {
	var req LoginReq
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "参数错误")
		return
	}

	// Demo mode: any 6-digit code works
	if len(req.Code) != 6 {
		utils.Error(c, 400, "验证码为6位数字")
		return
	}

	// Find or create user
	var user models.User
	result := database.DB.Where("phone = ?", req.Phone).First(&user)
	if result.Error != nil {
		// Auto-register
		user = models.User{
			Phone:    req.Phone,
			Nickname: "用户" + req.Phone[len(req.Phone)-4:],
			Role:     "customer",
		}
		database.DB.Create(&user)
	}

	// Generate JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"role":    user.Role,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})
	tokenStr, _ := token.SignedString([]byte(middleware.JWTSecret))

	utils.Success(c, gin.H{
		"token":    tokenStr,
		"user":     user,
	})
}

func GetProfile(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		utils.Error(c, 404, "用户不存在")
		return
	}
	utils.Success(c, user)
}

// ═══════════════════════════════════════════
// Label / Config Handlers
// ═══════════════════════════════════════════

func GetLabelSystem(c *gin.Context) {
	utils.Success(c, LabelSystem)
}

func GetLabelDimensions(c *gin.Context) {
	utils.Success(c, LabelDimensions)
}

func GetAppointmentStatus(c *gin.Context) {
	utils.Success(c, AppointmentStatus)
}

func GetCategories(c *gin.Context) {
	utils.Success(c, []string{"推荐", "春日", "简约", "法式", "显白", "有设计"})
}

// ═══════════════════════════════════════════
// Product Handlers (nail styles / 款式库)
// ═══════════════════════════════════════════

func GetProducts(c *gin.Context) {
	var products []models.Product
	query := database.DB.Where("shelf_status = ?", "active")

	if cat := c.Query("category"); cat != "" && cat != "推荐" {
		query = query.Where("category = ?", cat)
	}
	if shape := c.Query("label_shape"); shape != "" {
		query = query.Where("label_shape = ?", shape)
	}
	if tone := c.Query("label_tone"); tone != "" {
		query = query.Where("label_tone = ?", tone)
	}
	if style := c.Query("label_style"); style != "" {
		query = query.Where("label_style = ?", style)
	}
	if search := c.Query("search"); search != "" {
		query = query.Where("name LIKE ? OR description LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	sort := c.DefaultQuery("sort", "likes")
	switch sort {
	case "likes":
		query = query.Order("likes DESC")
	case "new":
		query = query.Order("created_at DESC")
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	var total int64
	query.Model(&models.Product{}).Count(&total)
	query.Offset((page - 1) * pageSize).Limit(pageSize).Find(&products)

	utils.Page(c, products, total, page, pageSize)
}

func GetProduct(c *gin.Context) {
	id := c.Param("id")
	var product models.Product
	if err := database.DB.First(&product, id).Error; err != nil {
		utils.Error(c, 404, "款式不存在")
		return
	}
	utils.Success(c, product)
}

// ═══════════════════════════════════════════
// Inspiration Themes
// ═══════════════════════════════════════════

func GetInspirationThemes(c *gin.Context) {
	var themes []models.InspirationTheme
	database.DB.Order("sort_order ASC").Find(&themes)
	utils.Success(c, themes)
}

// ═══════════════════════════════════════════
// Salon Handlers
// ═══════════════════════════════════════════

func GetSalons(c *gin.Context) {
	var salons []models.Salon
	query := database.DB.Where("status = ?", "active")

	if location := c.Query("location"); location != "" && location != "全部区域" {
		query = query.Where("location = ?", location)
	}
	if search := c.Query("search"); search != "" {
		query = query.Where("name LIKE ?", "%"+search+"%")
	}

	sort := c.DefaultQuery("sort", "rating")
	switch sort {
	case "rating":
		query = query.Order("rating DESC")
	case "distance":
		query = query.Order("distance ASC")
	case "reviews":
		query = query.Order("review_count DESC")
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var total int64
	query.Model(&models.Salon{}).Count(&total)
	query.Offset((page - 1) * pageSize).Limit(pageSize).Find(&salons)

	utils.Page(c, salons, total, page, pageSize)
}

func GetSalon(c *gin.Context) {
	id := c.Param("id")
	var salon models.Salon
	if err := database.DB.First(&salon, id).Error; err != nil {
		utils.Error(c, 404, "店铺不存在")
		return
	}

	// Load services
	var services []models.ServiceItem
	database.DB.Where("salon_id = ? AND status = ?", id, "active").Find(&services)

	// Load works (sample nail images as work thumbnails)
	works := []string{
		"/images/nails/nail-01.jpg",
		"/images/nails/nail-02.png",
		"/images/nails/nail-03.png",
	}

	utils.Success(c, gin.H{
		"salon":    salon,
		"services": services,
		"works":    works,
	})
}

func GetSalonArtists(c *gin.Context) {
	id := c.Param("id")
	var artists []models.Artist
	database.DB.Where("salon_id = ? AND status = ?", id, "active").Find(&artists)
	utils.Success(c, artists)
}

// ═══════════════════════════════════════════
// Artist Handlers
// ═══════════════════════════════════════════

func GetArtists(c *gin.Context) {
	var artists []models.Artist
	query := database.DB.Where("status = ?", "active")

	if salonID := c.Query("salon_id"); salonID != "" {
		query = query.Where("salon_id = ?", salonID)
	}

	var total int64
	query.Model(&models.Artist{}).Count(&total)
	query.Find(&artists)

	utils.Page(c, artists, total, 1, int(total))
}

func GetArtist(c *gin.Context) {
	id := c.Param("id")
	var artist models.Artist
	if err := database.DB.First(&artist, id).Error; err != nil {
		utils.Error(c, 404, "美甲师不存在")
		return
	}

	// Load works
	var works []models.ArtistWork
	database.DB.Where("artist_id = ?", id).Order("sort_order ASC").Find(&works)

	// Load reviews
	var reviews []models.Review
	database.DB.Where("artist_id = ? AND status = ?", id, "approved").Find(&reviews)

	// Load salon info
	var salon models.Salon
	database.DB.First(&salon, artist.SalonID)

	utils.Success(c, gin.H{
		"artist":  artist,
		"works":   works,
		"reviews": reviews,
		"salon":   salon,
	})
}

func GetArtistWorks(c *gin.Context) {
	id := c.Param("id")
	var works []models.ArtistWork
	database.DB.Where("artist_id = ?", id).Find(&works)
	utils.Success(c, works)
}

func GetArtistReviews(c *gin.Context) {
	id := c.Param("id")
	var reviews []models.Review
	database.DB.Where("artist_id = ? AND status = ?", id, "approved").Find(&reviews)
	utils.Success(c, reviews)
}

// ═══════════════════════════════════════════
// Reservation Handlers
// ═══════════════════════════════════════════

func CreateReservation(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req struct {
		SalonID      uint   `json:"salon_id" binding:"required"`
		ArtistID     *uint  `json:"artist_id"`
		ServiceName  string `json:"service_name"`
		ServicePrice int    `json:"service_price"`
		Date         string `json:"date" binding:"required"`
		Time         string `json:"time" binding:"required"`
		NailStyleID  *uint  `json:"nail_style_id"`
		DesignImage  string `json:"design_image_url"`
		Remark       string `json:"remark"`
		ContactName  string `json:"contact_name"`
		ContactPhone string `json:"contact_phone"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "参数不完整："+err.Error())
		return
	}

	// Look up salon & artist names
	var salon models.Salon
	database.DB.First(&salon, req.SalonID)

	artistName := ""
	if req.ArtistID != nil {
		var artist models.Artist
		database.DB.First(&artist, *req.ArtistID)
		artistName = artist.Name
	}

	reservation := models.Reservation{
		UserID:      userID.(uint),
		SalonID:     req.SalonID,
		ArtistID:    req.ArtistID,
		Customer:    req.ContactName,
		Phone:       req.ContactPhone,
		SalonName:   salon.Name,
		ArtistName:  artistName,
		ServiceName: req.ServiceName,
		ServicePrice: req.ServicePrice,
		Date:         req.Date,
		Time:         req.Time,
		NailStyleID:  req.NailStyleID,
		DesignImageURL: req.DesignImage,
		Remark:      req.Remark,
		Status:      "pending",
		StatusText:  "待确认",
		Location:    salon.Location,
	}
	database.DB.Create(&reservation)

	// Update user reservation count
	database.DB.Model(&models.User{}).Where("id = ?", userID).
		UpdateColumn("reservation_count", database.DB.Raw("reservation_count + 1"))

	utils.Created(c, reservation)
}

func GetUserReservations(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var reservations []models.Reservation

	query := database.DB.Where("user_id = ?", userID)
	if status := c.Query("status"); status != "" && status != "all" {
		query = query.Where("status = ?", status)
	}
	query.Order("date DESC, time DESC").Find(&reservations)

	utils.Success(c, reservations)
}

func GetReservation(c *gin.Context) {
	id := c.Param("id")
	var r models.Reservation
	if err := database.DB.First(&r, id).Error; err != nil {
		utils.Error(c, 404, "预约不存在")
		return
	}
	utils.Success(c, r)
}

func UpdateReservationStatus(c *gin.Context) {
	id := c.Param("id")
	action := c.Param("action")

	var r models.Reservation
	if err := database.DB.First(&r, id).Error; err != nil {
		utils.Error(c, 404, "预约不存在")
		return
	}

	var req struct {
		Reason string `json:"reason"`
	}
	c.ShouldBindJSON(&req)

	statusMap := map[string]struct{ status, text string }{
		"confirm":  {"confirmed", "已确认"},
		"cancel":   {"cancelled", "已取消"},
		"complete": {"completed", "已完成"},
	}

	if target, ok := statusMap[action]; ok {
		r.Status = target.status
		r.StatusText = target.text
		if action == "cancel" {
			r.CancelReason = req.Reason
		}
	} else if action == "change" {
		var changeReq struct {
			Date   string `json:"date"`
			Time   string `json:"time"`
			Reason string `json:"reason"`
		}
		c.ShouldBindJSON(&changeReq)
		if changeReq.Date != "" {
			r.Date = changeReq.Date
		}
		if changeReq.Time != "" {
			r.Time = changeReq.Time
		}
		r.Status = "changed"
		r.StatusText = "已变更"
		r.ChangeReason = changeReq.Reason
	} else {
		utils.Error(c, 400, "不支持的操作："+action)
		return
	}

	database.DB.Save(&r)
	utils.Success(c, r)
}

// ═══════════════════════════════════════════
// Order Handlers
// ═══════════════════════════════════════════

func GetUserOrders(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var orders []models.Order
	database.DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&orders)
	utils.Success(c, orders)
}

func GetOrder(c *gin.Context) {
	id := c.Param("id")
	var order models.Order
	if err := database.DB.First(&order, id).Error; err != nil {
		utils.Error(c, 404, "订单不存在")
		return
	}
	utils.Success(c, order)
}

// ═══════════════════════════════════════════
// Chat / Conversation Handlers
// ═══════════════════════════════════════════

func GetConversations(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var convs []models.Conversation
	database.DB.Where("user_id = ?", userID).Order("updated_at DESC").Find(&convs)
	utils.Success(c, convs)
}

func GetConversationMessages(c *gin.Context) {
	id := c.Param("id")
	var msgs []models.ChatMessage
	database.DB.Where("conversation_id = ?", id).Order("created_at ASC").Find(&msgs)
	utils.Success(c, msgs)
}

func SendMessage(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("user_id")

	var req struct {
		Content     string `json:"content"`
		MessageType string `json:"message_type"`
		ImageURL    string `json:"image_url"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "参数错误")
		return
	}

	msg := models.ChatMessage{
		ConversationID: parseUint(id),
		SenderType:     "user",
		Content:        req.Content,
		MessageType:    req.MessageType,
		ImageURL:       req.ImageURL,
		Time:           time.Now().Format("15:04"),
	}
	if req.MessageType == "" {
		msg.MessageType = "text"
	}
	if msg.Content == "" && msg.ImageURL != "" {
		msg.Content = "[图片]"
	}
	database.DB.Create(&msg)

	// Update conversation
	database.DB.Model(&models.Conversation{}).Where("id = ?", id).
		Updates(map[string]interface{}{
			"last_message": msg.Content,
			"time":         msg.Time,
			"updated_at":   time.Now(),
		})

	// Demo: auto-reply after 1 second
	go func() {
		time.Sleep(1 * time.Second)
		var conv models.Conversation
		database.DB.First(&conv, id)
		senders := []string{"artist", "salon"}
		sender := senders[time.Now().Unix()%2]
		replies := []string{"好的，收到~", "没问题，我帮您安排", "感谢您的回复！", "明白了，稍等哦~"}
		reply := replies[time.Now().Unix()%4]

		senderName := conv.ArtistName
		if sender == "salon" {
			// Extract salon name from "Nail Moment · Luna 群聊"
			if parts := strings.Split(conv.Name, " · "); len(parts) > 0 {
				senderName = parts[0]
			}
		}

		autoMsg := models.ChatMessage{
			ConversationID: parseUint(id),
			SenderType:     sender,
			SenderName:     senderName,
			Content:        reply,
			Time:           time.Now().Add(time.Minute).Format("15:04"),
		}
		database.DB.Create(&autoMsg)
	}()

	// Suppress unused warning
	_ = userID

	utils.Created(c, msg)
}

// ═══════════════════════════════════════════
// Review Handlers
// ═══════════════════════════════════════════

func CreateReview(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var req struct {
		OrderID   uint   `json:"order_id"`
		ArtistID  uint   `json:"artist_id" binding:"required"`
		SalonID   uint   `json:"salon_id" binding:"required"`
		Rating    int    `json:"rating" binding:"required"`
		Content   string `json:"content"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "参数错误")
		return
	}

	review := models.Review{
		UserID:   userID.(uint),
		ArtistID: req.ArtistID,
		SalonID:  req.SalonID,
		Rating:   req.Rating,
		Content:  req.Content,
		Date:     "刚刚",
		Status:   "approved",
	}
	database.DB.Create(&review)

	// Update artist rating
	var avgRating float64
	database.DB.Model(&models.Review{}).
		Where("artist_id = ? AND status = ?", req.ArtistID, "approved").
		Select("AVG(rating)").Scan(&avgRating)
	var count int64
	database.DB.Model(&models.Review{}).
		Where("artist_id = ? AND status = ?", req.ArtistID, "approved").Count(&count)

	database.DB.Model(&models.Artist{}).Where("id = ?", req.ArtistID).
		Updates(map[string]interface{}{
			"rating":       avgRating,
			"review_count": count,
		})

	utils.Created(c, review)
}

// ═══════════════════════════════════════════
// Favorites
// ═══════════════════════════════════════════

func GetFavorites(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var favs []models.Favorite
	database.DB.Where("user_id = ?", userID).Find(&favs)

	var productIDs []uint
	for _, f := range favs {
		productIDs = append(productIDs, f.ProductID)
	}

	var products []models.Product
	if len(productIDs) > 0 {
		database.DB.Where("id IN ?", productIDs).Find(&products)
	}
	utils.Success(c, products)
}

func ToggleFavorite(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var req struct {
		ProductID uint `json:"product_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "参数错误")
		return
	}

	var existing models.Favorite
	result := database.DB.Where("user_id = ? AND product_id = ?", userID, req.ProductID).First(&existing)
	if result.Error == nil {
		database.DB.Delete(&existing)
		database.DB.Model(&models.User{}).Where("id = ?", userID).
			UpdateColumn("favorite_count", database.DB.Raw("GREATEST(favorite_count - 1, 0)"))
		utils.Success(c, gin.H{"favorited": false})
	} else {
		fav := models.Favorite{UserID: userID.(uint), ProductID: req.ProductID}
		database.DB.Create(&fav)
		database.DB.Model(&models.User{}).Where("id = ?", userID).
			UpdateColumn("favorite_count", database.DB.Raw("favorite_count + 1"))
		utils.Created(c, gin.H{"favorited": true})
	}
}

// ═══════════════════════════════════════════
// Coupons
// ═══════════════════════════════════════════

func GetCoupons(c *gin.Context) {
	var coupons []models.Coupon
	database.DB.Find(&coupons)
	utils.Success(c, coupons)
}

// ═══════════════════════════════════════════
// User Profile
// ═══════════════════════════════════════════

func GetUserProfile(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		utils.Error(c, 404, "用户不存在")
		return
	}

	utils.Success(c, gin.H{
		"name":              user.Nickname,
		"avatar":            user.AvatarURL,
		"tryon_count":       user.TryonCount,
		"record_count":      user.RecordCount,
		"favorite_count":    user.FavoriteCount,
		"reservation_count": user.ReservationCount,
	})
}

// ═══════════════════════════════════════════
// TryOn (Demo - mock only)
// ═══════════════════════════════════════════

func TryOnGenerate(c *gin.Context) {
	// Demo: return the design image as "result" after 2s delay simulation
	// In production, this would call the AI gRPC service
	var req struct {
		HandImageURL   string `json:"hand_image_url"`
		DesignImageURL string `json:"design_image_url"`
		Labels         map[string]string `json:"labels"`
	}
	c.ShouldBindJSON(&req)

	// Mock result (just returns the design image as if overlaid)
	resultURL := req.DesignImageURL
	if resultURL == "" {
		resultURL = "/images/nails/nail-01.jpg"
	}

	utils.Success(c, gin.H{
		"result_url":  resultURL,
		"match_score": 96,
		"message":     "试戴生成成功（演示模式）",
	})
}

func TryOnLog(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var req struct {
		HandImageURL   string            `json:"hand_image_url"`
		DesignImageURL string            `json:"design_image_url"`
		ResultImageURL string            `json:"result_image_url"`
		Labels         map[string]string `json:"labels"`
		Source         string            `json:"source"`
		MatchScore     int               `json:"match_score"`
	}
	c.ShouldBindJSON(&req)

	labelsJSON, _ := json.Marshal(req.Labels)
	log := models.TryonLog{
		UserID:         uptr(userID.(uint)),
		HandImageURL:   req.HandImageURL,
		DesignImageURL: req.DesignImageURL,
		ResultImageURL: req.ResultImageURL,
		Labels:         string(labelsJSON),
		Source:         req.Source,
		MatchScore:     req.MatchScore,
	}
	database.DB.Create(&log)

	database.DB.Model(&models.User{}).Where("id = ?", userID).
		UpdateColumn("tryon_count", database.DB.Raw("tryon_count + 1"))

	utils.Created(c, gin.H{"logged": true})
}

func GetTryonHistory(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var logs []models.TryonLog
	database.DB.Where("user_id = ?", userID).Order("created_at DESC").Limit(20).Find(&logs)
	utils.Success(c, logs)
}

// ═══════════════════════════════════════════
// Merchant Handlers (Demo)
// ═══════════════════════════════════════════

func MerchantDailyReport(c *gin.Context) {
	utils.Success(c, gin.H{
		"revenue":           gin.H{"current": 8600, "previous": 7200, "unit": "元"},
		"traffic":           gin.H{"current": 48, "previous": 42, "unit": "人"},
		"avg_ticket":        gin.H{"current": 179, "previous": 171, "unit": "元"},
		"completion_rate":   gin.H{"current": 92, "previous": 88, "unit": "%"},
		"tag_revenue_ranking": []gin.H{
			{"tags": gin.H{"shape": "杏仁甲", "tone": "裸色", "craft": "渐变", "decor": "碎钻", "style": "温柔风"}, "revenue": 12800, "orders": 64, "share": 22.8},
		},
		"tryon_data": gin.H{"total_orders": 186, "total_tryons": 620, "conversion_rate": 30.0},
	})
}

func MerchantAppointments(c *gin.Context) {
	var reservations []models.Reservation
	query := database.DB.Order("date DESC, time DESC")

	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if artist := c.Query("artist"); artist != "" {
		query = query.Where("artist_name = ?", artist)
	}

	var total int64
	query.Model(&models.Reservation{}).Count(&total)
	query.Find(&reservations)

	utils.Page(c, reservations, total, 1, int(total))
}

func MerchantOrders(c *gin.Context) {
	var orders []models.Order
	database.DB.Order("created_at DESC").Find(&orders)

	var totalRevenue int64
	database.DB.Model(&models.Order{}).
		Where("status = ?", "completed").
		Select("COALESCE(SUM(actual_receivable), 0)").Scan(&totalRevenue)

	utils.Success(c, gin.H{
		"orders":        orders,
		"total_revenue": totalRevenue,
	})
}

func MerchantHotTags(c *gin.Context) {
	// Demo: return static hot tag data
	hotTags := []gin.H{
		{"tags": gin.H{"shape": "杏仁甲", "tone": "裸色", "craft": "渐变", "decor": "碎钻", "style": "温柔风"}, "try_on_count": 520, "order_count": 64},
		{"tags": gin.H{"shape": "方圆甲", "tone": "裸色", "craft": "纯色", "decor": "无装饰", "style": "简约风"}, "try_on_count": 420, "order_count": 42},
	}
	utils.Success(c, hotTags)
}

func MerchantStats(c *gin.Context) {
	var totalRevenue int64
	database.DB.Model(&models.Order{}).Where("status = ?", "completed").
		Select("COALESCE(SUM(actual_receivable), 0)").Scan(&totalRevenue)

	var totalOrders, totalCustomers int64
	database.DB.Model(&models.Order{}).Count(&totalOrders)
	database.DB.Model(&models.User{}).Where("role = ?", "customer").Count(&totalCustomers)

	var pendingCount, confirmedCount int64
	database.DB.Model(&models.Reservation{}).Where("status = ?", "pending").Count(&pendingCount)
	database.DB.Model(&models.Reservation{}).Where("status = ?", "confirmed").Count(&confirmedCount)

	utils.Success(c, gin.H{
		"total_revenue":     totalRevenue,
		"total_orders":      totalOrders,
		"total_customers":   totalCustomers,
		"pending_approvals": pendingCount + confirmedCount,
	})
}

// ═══════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════

func parseUint(s string) uint {
	id, _ := strconv.ParseUint(s, 10, 64)
	return uint(id)
}

func uptr(u uint) *uint { return &u }

// DumpMockData returns all seed data in the frontend mockData.js format
func DumpMockData(c *gin.Context) {
	var salons []models.Salon
	database.DB.Find(&salons)
	var artists []models.Artist
	database.DB.Find(&artists)
	var products []models.Product
	database.DB.Find(&products)
	var themes []models.InspirationTheme
	database.DB.Find(&themes)
	var reservations []models.Reservation
	database.DB.Find(&reservations)
	var orders []models.Order
	database.DB.Find(&orders)
	var convs []models.Conversation
	database.DB.Find(&convs)
	var coupons []models.Coupon
	database.DB.Find(&coupons)

	// Build conversation messages map
	chatMsgs := make(map[uint][]models.ChatMessage)
	for _, conv := range convs {
		var msgs []models.ChatMessage
		database.DB.Where("conversation_id = ?", conv.ID).Find(&msgs)
		chatMsgs[conv.ID] = msgs
	}

	utils.Success(c, gin.H{
		"label_system":         LabelSystem,
		"label_dimensions":     LabelDimensions,
		"appointment_status":   AppointmentStatus,
		"salons":               salons,
		"artists":              artists,
		"nail_styles":          products,
		"categories":           []string{"推荐", "春日", "简约", "法式", "显白", "有设计"},
		"inspiration_themes":   themes,
		"reservations":         reservations,
		"orders":               orders,
		"conversations":        convs,
		"chat_messages":        chatMsgs,
		"coupons":              coupons,
	})
}

// Health check
func Health(c *gin.Context) {
	c.String(http.StatusOK, "OK")
}

// Debug endpoint: print all routes
func DebugRoutes(r *gin.Engine) gin.HandlerFunc {
	return func(c *gin.Context) {
		routes := r.Routes()
		var paths []string
		for _, r := range routes {
			paths = append(paths, fmt.Sprintf("%s %s", r.Method, r.Path))
		}
		utils.Success(c, paths)
	}
}
