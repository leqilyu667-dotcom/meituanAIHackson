package seed

import (
	"encoding/json"
	"log"
	"time"

	"github.com/miaoshou/backend/database"
	"github.com/miaoshou/backend/models"
)

func Run() {
	db := database.DB

	// Skip if already seeded
	var count int64
	db.Model(&models.Salon{}).Count(&count)
	if count > 0 {
		log.Println("Database already seeded, skipping")
		return
	}

	log.Println("Seeding database...")

	// ═══ Users ═══
	users := []models.User{
		{Phone: "13800000001", Nickname: "小亲亲", Role: "customer", TryonCount: 12, ReservationCount: 3, FavoriteCount: 36, RecordCount: 8, AvatarURL: "Q"},
		{Phone: "13800000002", Nickname: "小美", Role: "customer", AvatarURL: "M"},
		{Phone: "13800000003", Nickname: "花花", Role: "customer", AvatarURL: "H"},
		{Phone: "13900000001", Nickname: "Nail Moment", Role: "merchant", SalonID: uptr(1), AvatarURL: "N"},
		{Phone: "13900000002", Nickname: "Her Nail Studio", Role: "merchant", SalonID: uptr(2), AvatarURL: "H"},
		{Phone: "13900000003", Nickname: "Mia Nails", Role: "merchant", SalonID: uptr(3), AvatarURL: "M"},
	}
	db.Create(&users)

	// ═══ Salons ═══
	salons := []models.Salon{
		{ID: 1, Name: "Nail Moment", Rating: 4.9, ReviewCount: 1280, ImageURL: "https://picsum.photos/seed/salon1/400/300", Location: "朝阳区", Distance: "1.2km", Description: "Nail Moment是一家专业的美甲沙龙，提供高品质的美甲服务。我们拥有经验丰富的美甲师团队，使用进口环保材料，为您打造最时尚、最精致的美甲作品。", Status: "active"},
		{ID: 2, Name: "Her Nail Studio", Rating: 4.8, ReviewCount: 960, ImageURL: "https://picsum.photos/seed/salon2/400/300", Location: "海淀区", Distance: "2.5km", Description: "Her Nail Studio 提供法式美甲、轻奢风格和定制款服务，环境舒适温馨。", Status: "active"},
		{ID: 3, Name: "Mia Nails", Rating: 4.7, ReviewCount: 780, ImageURL: "https://picsum.photos/seed/salon3/400/300", Location: "西城区", Distance: "3.1km", Description: "Mia Nails 专注蛋白矫正、鎏金美甲和新娘美甲定制。", Status: "active"},
		{ID: 4, Name: "指尖花语 Nail Art", Rating: 4.9, ReviewCount: 1560, ImageURL: "https://picsum.photos/seed/salon4/400/300", Location: "东城区", Distance: "2.8km", Status: "active"},
		{ID: 5, Name: "闪耀美甲坊", Rating: 4.6, ReviewCount: 620, ImageURL: "https://picsum.photos/seed/salon5/400/300", Location: "丰台区", Distance: "4.5km", Status: "active"},
		{ID: 6, Name: "J&J Nail Lounge", Rating: 4.8, ReviewCount: 890, ImageURL: "https://picsum.photos/seed/salon6/400/300", Location: "朝阳区", Distance: "1.8km", Status: "active"},
	}
	db.Create(&salons)

	// ═══ Service Items ═══
	services := []models.ServiceItem{
		{SalonID: 1, Name: "日式美甲", Description: "精致日式工艺", Price: 168, OriginalPrice: 268, DiscountText: "6.3折", ImageURL: "/images/nails/nail-01.jpg"},
		{SalonID: 1, Name: "芭比美甲", Description: "甜美芭比风", Price: 198, OriginalPrice: 298, DiscountText: "6.6折", ImageURL: "/images/nails/nail-02.png"},
		{SalonID: 1, Name: "延长甲", Description: "自然延长塑形", Price: 268, OriginalPrice: 398, DiscountText: "6.7折", ImageURL: "/images/nails/nail-03.png"},
		{SalonID: 1, Name: "美甲款式", Description: "时尚潮流款式", Price: 98, OriginalPrice: 168, DiscountText: "5.8折", ImageURL: "/images/nails/nail-04.png"},
		{SalonID: 1, Name: "法式美甲", Description: "经典优雅法式", Price: 128, OriginalPrice: 218, DiscountText: "5.9折", ImageURL: "/images/nails/nail-05.png"},
		{SalonID: 1, Name: "足部美甲", Description: "精致足部护理", Price: 188, OriginalPrice: 288, DiscountText: "6.5折", ImageURL: "/images/nails/nail-06.png"},
		{SalonID: 1, Name: "猫眼美甲", Description: "磁石猫眼效果", Price: 228, OriginalPrice: 358, DiscountText: "6.4折", ImageURL: "/images/nails/nail-07.png"},
		{SalonID: 1, Name: "手部护理", Description: "深层滋润护理", Price: 88, OriginalPrice: 158, DiscountText: "5.6折", ImageURL: "/images/nails/nail-08.png"},
		{SalonID: 2, Name: "法式美甲", Description: "经典法式", Price: 128, OriginalPrice: 218, DiscountText: "5.9折", ImageURL: "/images/nails/nail-03.png"},
		{SalonID: 2, Name: "轻奢风格", Description: "高级轻奢", Price: 258, OriginalPrice: 388, DiscountText: "6.6折", ImageURL: "/images/nails/nail-04.png"},
		{SalonID: 2, Name: "定制款", Description: "一对一设计", Price: 358, OriginalPrice: 498, DiscountText: "7.2折", ImageURL: "/images/nails/nail-08.png"},
		{SalonID: 3, Name: "蛋白矫正", Description: "甲面蛋白矫正", Price: 188, OriginalPrice: 268, DiscountText: "7.0折", ImageURL: "/images/nails/nail-09.png"},
		{SalonID: 3, Name: "鎏金美甲", Description: "奢华鎏金", Price: 268, OriginalPrice: 398, DiscountText: "6.7折", ImageURL: "/images/nails/nail-07.png"},
		{SalonID: 3, Name: "新娘美甲", Description: "婚礼定制", Price: 398, OriginalPrice: 598, DiscountText: "6.7折", ImageURL: "/images/nails/nail-01.jpg"},
	}
	db.Create(&services)

	// ═══ Artists ═══
	artists := []models.Artist{
		{ID: 1, SalonID: 1, SalonName: "Nail Moment", Name: "Luna", Title: "高级美甲师", Role: "资深美甲师", Avatar: "L", AvatarBg: "linear-gradient(135deg, #D9B8A0, #B98D72)", Bio: "从业 8 年，擅长日式精细美甲与法式经典系列，注重每一处细节与质感，曾获省级美甲大赛金奖。", Intro: "从业8年，曾在日本东京深造2年，擅长日式精致美甲与法式经典风格。", Specialty: "日式 / 法式", Years: 8, ServiceCount: 5200, RatingAttitude: 4.9, RatingEffect: 4.9, RatingAppearance: 4.9, Rating: 4.9, ReviewCount: 512, GoodReviews: 328},
		{ID: 2, SalonID: 1, SalonName: "Nail Moment", Name: "小雨", Title: "资深美甲师", Role: "高级美甲师", Avatar: "Y", AvatarBg: "linear-gradient(135deg, #c4a882, #9c725a)", Bio: "从业 5 年，色彩感极强，尤擅渐变晕染与闪粉叠层工艺。", Intro: "从业5年，擅长甜美风格的芭比美甲和自然延长甲技术。", Specialty: "渐变 / 闪粉", Years: 5, ServiceCount: 3100, RatingAttitude: 4.8, RatingEffect: 4.8, RatingAppearance: 4.7, Rating: 4.8, ReviewCount: 289, GoodReviews: 512},
		{ID: 3, SalonID: 1, SalonName: "Nail Moment", Name: "Nicole", Title: "美甲设计师", Role: "创意总监", Avatar: "N", AvatarBg: "linear-gradient(135deg, #bfa98e, #8B6D5A)", Bio: "毕业于设计专业，将插画艺术融入美甲创作。", Intro: "从业8年，曾在韩国首尔担任美甲创意总监3年。", Specialty: "复古 / 艺术", Years: 6, ServiceCount: 4500, RatingAttitude: 4.9, RatingEffect: 4.9, RatingAppearance: 4.9, Rating: 4.9, ReviewCount: 356, GoodReviews: 447},
		{ID: 4, SalonID: 1, SalonName: "Nail Moment", Name: "Mia", Title: "美甲师", Role: "美甲师", Avatar: "M", AvatarBg: "linear-gradient(135deg, #e0cfc4, #C4A882)", Bio: "专攻甲型修正与延长甲工艺，手法轻柔不伤甲床。", Intro: "从业3年，擅长猫眼磁石美甲和各种闪粉技法。", Specialty: "延长 / 修型", Years: 3, ServiceCount: 1500, RatingAttitude: 4.7, RatingEffect: 4.6, RatingAppearance: 4.7, Rating: 4.7, ReviewCount: 198, GoodReviews: 289},
		{ID: 5, SalonID: 2, SalonName: "Her Nail Studio", Name: "思思", Title: "高级美甲师", Role: "高级美甲师", Avatar: "S", Specialty: "猫眼 / 闪粉", Years: 5, Rating: 4.8, GoodReviews: 289},
		{ID: 6, SalonID: 2, SalonName: "Her Nail Studio", Name: "安安", Title: "资深美甲师", Role: "资深美甲师", Avatar: "A", Specialty: "手部护理 / 足部美甲", Years: 7, Rating: 4.8, GoodReviews: 356},
	}
	db.Create(&artists)

	// ═══ Artist Works ═══
	works := []models.ArtistWork{
		{ArtistID: 1, Title: "春日花语", CustomerRefURL: "/images/nails/nail-10.png", ActualResultURL: "/images/nails/nail-01.jpg"},
		{ArtistID: 1, Title: "经典法式", CustomerRefURL: "/images/nails/nail-11.png", ActualResultURL: "/images/nails/nail-03.png"},
		{ArtistID: 1, Title: "渐变星空", CustomerRefURL: "/images/nails/nail-12.png", ActualResultURL: "/images/nails/nail-06.png"},
		{ArtistID: 2, Title: "鎏金闪粉", CustomerRefURL: "/images/nails/nail-08.png", ActualResultURL: "/images/nails/nail-04.png"},
		{ArtistID: 2, Title: "裸感冰透", CustomerRefURL: "/images/nails/nail-09.png", ActualResultURL: "/images/nails/nail-02.png"},
		{ArtistID: 3, Title: "复古酒红", CustomerRefURL: "/images/nails/nail-05.png", ActualResultURL: "/images/nails/nail-05.png"},
		{ArtistID: 3, Title: "艺术手绘", CustomerRefURL: "/images/nails/nail-11.png", ActualResultURL: "/images/nails/nail-07.png"},
	}
	db.Create(&works)

	// ═══ Products (nail styles) ═══
	products := []models.Product{
		{ID: 1, SalonID: 1, Name: "春日新款", Description: "温柔气质，粉嫩花卉", ImageURL: "/images/nails/nail-01.jpg", Category: "春日", LabelShape: "杏仁甲", LabelTone: "裸色", LabelCraft: "手绘", LabelDecor: "立体雕花", LabelStyle: "温柔风", Likes: 2341, IsNew: true},
		{ID: 2, SalonID: 1, Name: "冰透裸色", Description: "自然百搭，通勤首选", ImageURL: "/images/nails/nail-02.png", Category: "裸色", LabelShape: "方圆甲", LabelTone: "裸色", LabelCraft: "纯色", LabelDecor: "无装饰", LabelStyle: "简约风", Likes: 1892},
		{ID: 3, SalonID: 1, Name: "奶油法式", Description: "经典优雅，法式白边", ImageURL: "/images/nails/nail-03.png", Category: "法式", LabelShape: "方圆甲", LabelTone: "裸色", LabelCraft: "纯色", LabelDecor: "无装饰", LabelStyle: "法式", Likes: 3421},
		{ID: 4, SalonID: 1, Name: "渐变闪粉", Description: "闪耀夺目，派对必备", ImageURL: "/images/nails/nail-04.png", Category: "闪粉", LabelShape: "杏仁甲", LabelTone: "亮色", LabelCraft: "渐变", LabelDecor: "碎钻", LabelStyle: "甜酷风", Likes: 1567, IsNew: true},
		{ID: 5, SalonID: 1, Name: "复古红棕", Description: "显白气质，秋冬经典", ImageURL: "/images/nails/nail-05.png", Category: "红色", LabelShape: "梯形甲", LabelTone: "红色系", LabelCraft: "纯色", LabelDecor: "金/银碎箔", LabelStyle: "法式", Likes: 2156},
		{ID: 6, SalonID: 1, Name: "清新薄荷", Description: "清凉夏日，绿意盎然", ImageURL: "/images/nails/nail-06.png", Category: "绿色", LabelShape: "圆甲", LabelTone: "冷色", LabelCraft: "纯色", LabelDecor: "无装饰", LabelStyle: "简约风", Likes: 1432, IsNew: true},
	}
	db.Create(&products)

	// ═══ Inspiration Themes ═══
	themes := []models.InspirationTheme{
		{ID: 1, Name: "春日花语", CoverImageURL: "/images/nails/nail-01.jpg", ProductCount: 24, Category: "春日", LabelShape: "杏仁甲", LabelTone: "裸色", LabelCraft: "手绘", LabelDecor: "立体雕花", LabelStyle: "温柔风"},
		{ID: 2, Name: "法式经典", CoverImageURL: "/images/nails/nail-03.png", ProductCount: 18, Category: "法式", LabelShape: "方圆甲", LabelTone: "裸色", LabelCraft: "纯色", LabelDecor: "无装饰", LabelStyle: "法式"},
		{ID: 3, Name: "闪粉派对", CoverImageURL: "/images/nails/nail-04.png", ProductCount: 16, Category: "闪粉", LabelShape: "杏仁甲", LabelTone: "亮色", LabelCraft: "渐变", LabelDecor: "碎钻", LabelStyle: "甜酷风"},
		{ID: 4, Name: "极简裸色", CoverImageURL: "/images/nails/nail-02.png", ProductCount: 22, Category: "裸色", LabelShape: "圆甲", LabelTone: "裸色", LabelCraft: "纯色", LabelDecor: "无装饰", LabelStyle: "简约风"},
		{ID: 5, Name: "渐变星空", CoverImageURL: "/images/nails/nail-06.png", ProductCount: 15, Category: "渐变", LabelShape: "梯形甲", LabelTone: "冷色", LabelCraft: "渐变", LabelDecor: "金/银碎箔", LabelStyle: "ins风"},
		{ID: 6, Name: "复古酒红", CoverImageURL: "/images/nails/nail-05.png", ProductCount: 20, Category: "红色", LabelShape: "梯形甲", LabelTone: "红色系", LabelCraft: "纯色", LabelDecor: "金/银碎箔", LabelStyle: "法式"},
		{ID: 7, Name: "几何线条", CoverImageURL: "/images/nails/nail-08.png", ProductCount: 12, Category: "设计", LabelShape: "尖甲", LabelTone: "金属", LabelCraft: "纯色", LabelDecor: "金/银碎箔", LabelStyle: "ins风"},
		{ID: 8, Name: "樱花物语", CoverImageURL: "/images/nails/nail-12.png", ProductCount: 19, Category: "日式", LabelShape: "杏仁甲", LabelTone: "透色", LabelCraft: "晕染", LabelDecor: "珍珠/铆钉", LabelStyle: "日式"},
	}
	db.Create(&themes)

	// ═══ Reservations ═══
	reservations := []models.Reservation{
		{UserID: 1, SalonID: 1, ArtistID: uptr(1), Customer: "小美", Phone: "138****6789", SalonName: "Nail Moment 美甲坊", ArtistName: "Luna", ArtistAvatar: "L", ChatID: uptr(1), NailStyleID: uptr(3), NailStyleName: "奶油法式", NailImageURL: "/images/nails/nail-03.png", ServiceName: "法式美甲", ServicePrice: 128, Date: "2026-05-28", Time: "14:00", Status: "confirmed", StatusText: "已确认", Location: "朝阳区 · 1.2km", Remark: "想做温柔一点的款式"},
		{UserID: 1, SalonID: 2, ArtistID: uptr(2), Customer: "花花", Phone: "139****8901", SalonName: "Her Nail Studio", ArtistName: "小雨", ArtistAvatar: "Y", ChatID: uptr(2), NailStyleID: uptr(1), NailStyleName: "春日新款", NailImageURL: "/images/nails/nail-01.jpg", ServiceName: "日式美甲", ServicePrice: 168, Date: "2026-06-02", Time: "10:00", Status: "pending", StatusText: "待确认", Location: "海淀区 · 2.5km"},
		{UserID: 1, SalonID: 1, ArtistID: uptr(1), Customer: "娜娜", Phone: "136****0123", SalonName: "Nail Moment 美甲坊", ArtistName: "Luna", ArtistAvatar: "L", ChatID: uptr(1), NailStyleID: uptr(4), NailStyleName: "渐变闪粉", NailImageURL: "/images/nails/nail-04.png", ServiceName: "芭比美甲", ServicePrice: 198, Date: "2026-06-15", Time: "15:30", Status: "changed", StatusText: "已变更", Location: "朝阳区 · 1.2km", ChangeReason: "客户要求调整时间"},
		{UserID: 2, SalonID: 3, ArtistID: uptr(3), Customer: "婷婷", Phone: "135****7890", SalonName: "Mia Nails", ArtistName: "Nicole", ArtistAvatar: "N", NailStyleID: uptr(5), NailStyleName: "复古红棕", NailImageURL: "/images/nails/nail-05.png", ServiceName: "鎏金美甲", ServicePrice: 268, Date: "2026-05-20", Time: "11:00", Status: "completed", StatusText: "已完成", Location: "西城区 · 3.1km"},
	}
	db.Create(&reservations)

	// ═══ Orders ═══
	orders := []models.Order{
		{OrderNo: "NM20260408001", UserID: 1, SalonID: 1, CustomerName: "小美", SalonName: "Nail Moment 美甲坊", ArtistName: "Luna", ServiceName: "日式美甲", ActualReceivable: 168, Price: 168, ImageURL: "/images/nails/nail-02.png", Status: "completed", StatusText: "已完成", Date: "2026-04-08"},
		{OrderNo: "HS20260325002", UserID: 2, SalonID: 2, CustomerName: "花花", SalonName: "Her Nail Studio", ArtistName: "小雨", ServiceName: "法式美甲", ActualReceivable: 128, Price: 128, ImageURL: "/images/nails/nail-03.png", Status: "completed", StatusText: "已完成", Date: "2026-03-25"},
		{OrderNo: "NM20260515003", UserID: 3, SalonID: 1, CustomerName: "娜娜", SalonName: "Nail Moment 美甲坊", ArtistName: "Luna", ServiceName: "芭比美甲", ActualReceivable: 198, Price: 198, ImageURL: "/images/nails/nail-04.png", Status: "upcoming", StatusText: "待服务", Date: "2026-05-15"},
	}
	db.Create(&orders)

	// ═══ Conversations ═══
	now := time.Now()
	convs := []models.Conversation{
		{ID: 1, SalonID: 1, ArtistID: 1, UserID: 1, Name: "Nail Moment · Luna 群聊", Avatar: "N", ArtistName: "Luna", LastMessage: "Luna：您的预约已通过，明天下午2点见~", Time: "09:21", UnreadCount: 1, Type: "group", UpdatedAt: now},
		{ID: 2, SalonID: 2, ArtistID: 2, UserID: 1, Name: "Her Nail Studio · 小雨 群聊", Avatar: "H", ArtistName: "小雨", LastMessage: "小雨：您好，请问有什么可以帮您？", Time: "昨天", Type: "group", UpdatedAt: now.Add(-24 * time.Hour)},
		{ID: 3, SalonID: 3, ArtistID: 3, UserID: 2, Name: "Mia Nails · Nicole 群聊", Avatar: "M", ArtistName: "Nicole", LastMessage: "Nicole：感谢您的光临，期待下次再见~", Time: "04/10", Type: "group", UpdatedAt: now.Add(-48 * time.Hour)},
	}
	db.Create(&convs)

	// ═══ Chat Messages ═══
	msgs := []models.ChatMessage{
		{ConversationID: 1, SenderType: "salon", SenderName: "Nail Moment", Content: "欢迎光临 Nail Moment 美甲坊！我是店长，已为您安排美甲师 Luna 为您服务~", Time: "09:15"},
		{ConversationID: 1, SenderType: "artist", SenderName: "Luna", Content: "您好，我是美甲师 Luna，很高兴为您服务！请问有什么偏好的款式吗？", Time: "09:16"},
		{ConversationID: 1, SenderType: "salon", SenderName: "Nail Moment", Content: "您的预约已通过，明天下午2点见~", Time: "09:17"},
		{ConversationID: 1, SenderType: "user", SenderName: "", Content: "好的，谢谢！我想做一款日式美甲", Time: "09:18"},
		{ConversationID: 1, SenderType: "artist", SenderName: "Luna", Content: "日式美甲很适合您！到店后我给您看一些款式参考~", Time: "09:20"},
		{ConversationID: 2, SenderType: "artist", SenderName: "小雨", Content: "您好，我是美甲师小雨！欢迎来到 Her Nail Studio~", Time: "昨天 14:30"},
		{ConversationID: 2, SenderType: "user", SenderName: "", Content: "你好！我想做一个法式美甲", Time: "昨天 14:32"},
		{ConversationID: 2, SenderType: "salon", SenderName: "Her Nail Studio", Content: "法式美甲是我们店的热门项目，小雨老师很擅长哦~", Time: "昨天 14:33"},
		{ConversationID: 3, SenderType: "salon", SenderName: "Mia Nails", Content: "感谢您的光临！您做的款式真好看~", Time: "04/10 16:20"},
		{ConversationID: 3, SenderType: "user", SenderName: "", Content: "谢谢！Nicole老师服务很好，我很满意", Time: "04/10 16:22"},
	}
	db.Create(&msgs)

	// ═══ Reviews ═══
	reviews := []models.Review{
		{ArtistID: 1, SalonID: 1, UserID: 2, Name: "小美", Rating: 5, Content: "手法非常细腻，做出来的款式和参考图一模一样！", Date: "3天前", StyleImageURL: "/images/nails/nail-01.jpg", ResultImageURL: "/images/nails/nail-03.png"},
		{ArtistID: 1, SalonID: 1, UserID: 3, Name: "花花", Rating: 5, Content: "Luna 姐人超好，会根据手型推荐合适款式，非常专业。", Date: "1周前"},
		{ArtistID: 2, SalonID: 2, UserID: 1, Name: "晴晴", Rating: 5, Content: "渐变做得超好看，颜色过渡自然，朋友都问我在哪做的！", Date: "2天前"},
	}
	db.Create(&reviews)

	// ═══ Coupons ═══
	coupons := []models.Coupon{
		{Title: "新人专享券", DiscountText: "满100减30", Condition: "新用户首次下单可用", Amount: 30, ExpireDate: "2026-06-30"},
		{Title: "春日美甲券", DiscountText: "满200减50", Condition: "限春日系列款式", Amount: 50, ExpireDate: "2026-05-31"},
		{Title: "会员专属券", DiscountText: "8折优惠", Condition: "全场通用，最高减80元", Amount: 80, ExpireDate: "2026-07-15"},
	}
	db.Create(&coupons)

	log.Println("Seed data created successfully")
}

func uptr(u uint) *uint { return &u }

// mustMarshal is a helper for JSON fields
func MustMarshal(v interface{}) string {
	b, _ := json.Marshal(v)
	return string(b)
}
