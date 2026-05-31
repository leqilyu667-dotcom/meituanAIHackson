package models

import (
	"database/sql"
	"time"

	"gorm.io/gorm"
)

// ═══════════════════════════════════════════
// Users & Auth
// ═══════════════════════════════════════════

type User struct {
	ID               uint           `gorm:"primaryKey" json:"id"`
	Phone            string         `gorm:"uniqueIndex;size:20" json:"phone"`
	PasswordHash     string         `gorm:"size:255" json:"-"`
	Nickname         string         `gorm:"size:50;default:''" json:"nickname"`
	AvatarURL        string         `gorm:"size:500" json:"avatar_url"`
	City             string         `gorm:"size:50" json:"city"`
	Role             string         `gorm:"size:20;default:customer" json:"role"`
	TryonCount       int            `gorm:"default:0" json:"tryon_count"`
	ReservationCount int            `gorm:"default:0" json:"reservation_count"`
	FavoriteCount    int            `gorm:"default:0" json:"favorite_count"`
	RecordCount      int            `gorm:"default:0" json:"record_count"`
	SalonID          *uint          `json:"salon_id"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}

// ═══════════════════════════════════════════
// Salons
// ═══════════════════════════════════════════

type Salon struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	MerchantID    *uint          `json:"merchant_id"`
	Name          string         `gorm:"size:100;not null" json:"name"`
	Rating        float64        `json:"rating"`
	ReviewCount   int            `gorm:"default:0" json:"reviews"`
	ImageURL      string         `gorm:"size:500" json:"image"`
	Location      string         `gorm:"size:100" json:"location"`
	Address       string         `gorm:"size:500" json:"address"`
	Distance      string         `gorm:"size:20" json:"distance"`
	Description   string         `gorm:"type:text" json:"description"`
	Phone         string         `gorm:"size:20" json:"phone"`
	Scale         string         `gorm:"size:20;default:中型店" json:"scale"`
	Status        string         `gorm:"size:20;default:active" json:"status"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`

	// JSON strings (stored as TEXT in SQLite)
	ServicesJSON   string `gorm:"type:text" json:"-"`
	WorksJSON      string `gorm:"type:text" json:"-"`
	ImagesJSON     string `gorm:"type:text" json:"-"`
}

type ServiceItem struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	SalonID       uint           `gorm:"index;not null" json:"salon_id"`
	Name          string         `gorm:"size:100;not null" json:"name"`
	Description   string         `gorm:"size:300" json:"desc"`
	ImageURL      string         `gorm:"size:500" json:"image"`
	Price         int            `json:"price"`
	OriginalPrice int            `json:"original_price"`
	DiscountText  string         `gorm:"size:20" json:"discount"`
	SortOrder     int            `gorm:"default:0" json:"sort_order"`
	Status        string         `gorm:"size:20;default:active" json:"status"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

// ═══════════════════════════════════════════
// Artists
// ═══════════════════════════════════════════

type Artist struct {
	ID               uint           `gorm:"primaryKey" json:"id"`
	SalonID          uint           `gorm:"index;not null" json:"salon_id"`
	SalonName        string         `gorm:"size:100" json:"salon_name"`
	Name             string         `gorm:"size:50;not null" json:"name"`
	Title            string         `gorm:"size:50" json:"title"`
	Role             string         `gorm:"size:50" json:"role"`
	Avatar           string         `gorm:"size:10" json:"avatar"`
	AvatarBg         string         `gorm:"size:100" json:"avatar_bg"`
	Bio              string         `gorm:"type:text" json:"bio"`
	Intro            string         `gorm:"type:text" json:"intro"`
	Specialty        string         `gorm:"size:200" json:"specialty"`
	Years            int            `gorm:"default:0" json:"years"`
	ServiceCount     int            `gorm:"default:0" json:"service_count"`
	RatingAttitude   float64        `json:"rating_attitude"`
	RatingEffect     float64        `json:"rating_effect"`
	RatingAppearance float64        `json:"rating_appearance"`
	Rating           float64        `json:"rating"`
	ReviewCount      int            `gorm:"default:0" json:"reviews"`
	GoodReviews      int            `gorm:"default:0" json:"good_reviews"`
	Availability     string         `gorm:"size:300" json:"availability"`
	SortOrder        int            `gorm:"default:0" json:"sort_order"`
	Status           string         `gorm:"size:20;default:active" json:"status"`

	// JSON strings
	TagsJSON         string `gorm:"type:text" json:"-"`
	CertificatesJSON string `gorm:"type:text" json:"-"`
	BadgeJSON        string `gorm:"type:text" json:"-"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
}

type ArtistWork struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	ArtistID        uint      `gorm:"index;not null" json:"artist_id"`
	Title           string    `gorm:"size:100" json:"title"`
	CustomerRefURL  string    `gorm:"size:500" json:"customer_ref_url"`
	ActualResultURL string    `gorm:"size:500" json:"actual_result_url"`
	LabelsJSON      string    `gorm:"type:text" json:"-"`
	SortOrder       int       `gorm:"default:0" json:"sort_order"`
	CreatedAt       time.Time `json:"created_at"`
}

// ═══════════════════════════════════════════
// Products / Inspiration
// ═══════════════════════════════════════════

type Product struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	SalonID     uint           `gorm:"index;not null" json:"-"`
	Name        string         `gorm:"size:100;not null" json:"name"`
	Description string         `gorm:"size:500" json:"description"`
	ImageURL    string         `gorm:"size:500" json:"image"`
	Category    string         `gorm:"size:50" json:"category"`

	LabelShape string `gorm:"size:20" json:"-"`
	LabelTone  string `gorm:"size:20" json:"-"`
	LabelCraft string `gorm:"size:20" json:"-"`
	LabelDecor string `gorm:"size:20" json:"-"`
	LabelStyle string `gorm:"size:20" json:"-"`

	Likes       int            `gorm:"default:0" json:"likes"`
	IsNew       bool           `gorm:"default:false" json:"is_new"`
	ShelfStatus string         `gorm:"size:20;default:active" json:"shelf_status"`
	SortOrder   int            `gorm:"default:0" json:"sort_order"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type InspirationTheme struct {
	ID            uint   `gorm:"primaryKey" json:"id"`
	SalonID       *uint  `json:"-"`
	Name          string `gorm:"size:100;not null" json:"name"`
	CoverImageURL string `gorm:"size:500" json:"cover_image_url"`
	ProductCount  int    `gorm:"default:0" json:"count"`
	Category      string `gorm:"size:50" json:"category"`
	LabelShape    string `gorm:"size:20" json:"-"`
	LabelTone     string `gorm:"size:20" json:"-"`
	LabelCraft    string `gorm:"size:20" json:"-"`
	LabelDecor    string `gorm:"size:20" json:"-"`
	LabelStyle    string `gorm:"size:20" json:"-"`
	SortOrder     int    `gorm:"default:0" json:"sort_order"`
}

// ═══════════════════════════════════════════
// Reservations
// ═══════════════════════════════════════════

type Reservation struct {
	ID            uint   `gorm:"primaryKey" json:"id"`
	UserID        uint   `gorm:"index;not null" json:"-"`
	SalonID       uint   `gorm:"index;not null" json:"salon_id"`
	ArtistID      *uint  `json:"artist_id"`
	Customer      string `gorm:"size:50" json:"customer"`
	Phone         string `gorm:"size:20" json:"phone"`
	SalonName     string `gorm:"size:100" json:"salon_name"`
	ArtistName    string `gorm:"size:50" json:"artist_name"`
	ArtistAvatar  string `gorm:"size:10" json:"artist_avatar"`
	ChatID        *uint  `json:"chat_id"`
	NailStyleID   *uint  `json:"nail_style_id"`
	NailStyleName string `gorm:"size:100" json:"nail_style_name"`
	NailImageURL  string `gorm:"size:500" json:"nail_image"`
	ServiceName   string `gorm:"size:100" json:"service"`
	ServicePrice  int    `json:"price"`
	Date          string `gorm:"size:20" json:"date"`
	Time          string `gorm:"size:10" json:"time"`
	Status        string `gorm:"size:20;default:pending" json:"status"`
	StatusText    string `gorm:"size:20" json:"status_text"`
	Location      string `gorm:"size:100" json:"location"`
	Remark        string `gorm:"type:text" json:"remark"`
	LabelsJSON    string `gorm:"type:text" json:"-"`
	CancelReason  string `gorm:"size:500" json:"cancel_reason,omitempty"`
	ChangeReason  string `gorm:"size:500" json:"change_reason,omitempty"`
	CreatedAt     time.Time `json:"-"`
	UpdatedAt     time.Time `json:"-"`
}

// ═══════════════════════════════════════════
// Orders
// ═══════════════════════════════════════════

type Order struct {
	ID               uint   `gorm:"primaryKey" json:"id"`
	OrderNo          string `gorm:"uniqueIndex;size:30" json:"order_no"`
	UserID           uint   `gorm:"index;not null" json:"-"`
	SalonID          uint   `gorm:"index;not null" json:"-"`
	ArtistID         *uint  `json:"-"`
	CustomerName     string `gorm:"size:50" json:"customer_name"`
	SalonName        string `gorm:"size:100" json:"salon_name"`
	ArtistName       string `gorm:"size:50" json:"artist_name"`
	ServiceName      string `gorm:"size:100" json:"service"`
	ActualReceivable int    `json:"actual_receivable"`
	Price            int    `json:"price"`
	LabelsJSON       string `gorm:"type:text" json:"-"`
	ImageURL         string `gorm:"size:500" json:"image"`
	Status           string `gorm:"size:20;default:completed" json:"status"`
	StatusText       string `gorm:"size:20" json:"status_text"`
	Date             string `gorm:"size:20" json:"date"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"-"`
}

// ═══════════════════════════════════════════
// Reviews
// ═══════════════════════════════════════════

type Review struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	OrderID        *uint          `json:"-"`
	UserID         uint           `gorm:"index;not null" json:"-"`
	ArtistID       uint           `gorm:"index;not null" json:"-"`
	SalonID        uint           `gorm:"index;not null" json:"-"`
	Name           string         `gorm:"size:50" json:"name"`
	Rating         int            `json:"rating"`
	Content        string         `gorm:"type:text" json:"content"`
	Date           string         `gorm:"size:20" json:"date"`
	StyleImageURL  string         `gorm:"size:500" json:"style_image_url"`
	ResultImageURL string         `gorm:"size:500" json:"result_image_url"`
	ReplyContent   sql.NullString `json:"-"`
	Status         string         `gorm:"size:20;default:approved" json:"-"`
	CreatedAt      time.Time      `json:"-"`
}

// ═══════════════════════════════════════════
// Chat
// ═══════════════════════════════════════════

type Conversation struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	SalonID          uint      `gorm:"index;not null" json:"salon_id"`
	ArtistID         uint      `gorm:"index;not null" json:"artist_id"`
	UserID           uint      `gorm:"index;not null" json:"-"`
	Name             string    `gorm:"size:100" json:"name"`
	Avatar           string    `gorm:"size:10" json:"avatar"`
	ArtistName       string    `gorm:"size:50" json:"artist_name"`
	LastMessage      string    `gorm:"type:text" json:"content"`
	LastMessageAt    time.Time `json:"-"`
	Time             string    `gorm:"size:20" json:"time"`
	UnreadCount      int       `gorm:"default:0" json:"unread"`
	Type             string    `gorm:"size:20;default:group" json:"type"`
	CreatedAt        time.Time `json:"-"`
	UpdatedAt        time.Time `json:"-"`
}

type ChatMessage struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	ConversationID uint      `gorm:"index;not null" json:"-"`
	SenderType     string    `gorm:"size:20;not null" json:"sender"`
	SenderName     string    `gorm:"size:50" json:"sender_name"`
	Content        string    `gorm:"type:text" json:"text"`
	ImageURL       string    `gorm:"size:500" json:"image,omitempty"`
	Time           string    `gorm:"size:20" json:"time"`
	CreatedAt      time.Time `json:"-"`
}
