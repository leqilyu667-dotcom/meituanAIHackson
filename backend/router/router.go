package router

import (
	"github.com/gin-gonic/gin"

	"github.com/miaoshou/backend/handlers"
	"github.com/miaoshou/backend/middleware"
)

func Setup() *gin.Engine {
	r := gin.Default()

	// CORS
	r.Use(middleware.CORSMiddleware("http://localhost:5173"))

	// Health
	r.GET("/health", handlers.Health)

	// Debug routes
	r.GET("/debug/routes", handlers.DebugRoutes(r))

	api := r.Group("/v1")
	{
		// ═══ Auth (no auth required) ═══
		auth := api.Group("/auth")
		{
			auth.POST("/send-code", handlers.SendCode)
			auth.POST("/login", handlers.Login)
		}

		// ═══ Public config ═══
		api.GET("/labels/system", handlers.GetLabelSystem)
		api.GET("/labels/dimensions", handlers.GetLabelDimensions)
		api.GET("/appointment-status", handlers.GetAppointmentStatus)
		api.GET("/categories", handlers.GetCategories)

		// ═══ Products (public browse) ═══
		products := api.Group("/products")
		{
			products.GET("", handlers.GetProducts)
			products.GET("/:id", handlers.GetProduct)
		}

		// ═══ Inspiration (public) ═══
		api.GET("/inspiration-themes", handlers.GetInspirationThemes)

		// ═══ Salons (public browse) ═══
		salons := api.Group("/salons")
		{
			salons.GET("", handlers.GetSalons)
			salons.GET("/:id", handlers.GetSalon)
			salons.GET("/:id/artists", handlers.GetSalonArtists)
		}

		// ═══ Artists (public browse) ═══
		artists := api.Group("/artists")
		{
			artists.GET("", handlers.GetArtists)
			artists.GET("/:id", handlers.GetArtist)
			artists.GET("/:id/works", handlers.GetArtistWorks)
			artists.GET("/:id/reviews", handlers.GetArtistReviews)
		}

		// ═══ Auth required ═══
		authed := api.Group("")
		authed.Use(middleware.AuthRequired())
		{
			// User profile
			authed.GET("/auth/profile", handlers.GetProfile)
			authed.GET("/users/me", handlers.GetUserProfile)
			authed.GET("/users/me/coupons", handlers.GetCoupons)

			// Favorites
			authed.GET("/users/me/favorites", handlers.GetFavorites)
			authed.POST("/users/me/favorites", handlers.ToggleFavorite)

			// TryOn
			authed.POST("/tryon/generate", handlers.TryOnGenerate)
			authed.POST("/tryon/log", handlers.TryOnLog)
			authed.GET("/tryon/history", handlers.GetTryonHistory)

			// Reservations
			reservations := authed.Group("/reservations")
			{
				reservations.POST("", handlers.CreateReservation)
				reservations.GET("", handlers.GetUserReservations)
				reservations.GET("/:id", handlers.GetReservation)
				reservations.PUT("/:id/confirm", handlers.UpdateReservationStatus)
				reservations.PUT("/:id/cancel", handlers.UpdateReservationStatus)
				reservations.PUT("/:id/complete", handlers.UpdateReservationStatus)
				reservations.PUT("/:id/change", handlers.UpdateReservationStatus)
			}

			// Orders
			authed.GET("/orders", handlers.GetUserOrders)
			authed.GET("/orders/:id", handlers.GetOrder)
			authed.POST("/orders/:id/review", handlers.CreateReview)

			// Reviews
			authed.POST("/reviews", handlers.CreateReview)

			// Chat / Conversations
			convs := authed.Group("/conversations")
			{
				convs.GET("", handlers.GetConversations)
				convs.GET("/:id/messages", handlers.GetConversationMessages)
				convs.POST("/:id/messages", handlers.SendMessage)
				convs.POST("/:id/messages/image", handlers.SendMessage)
			}

			// ═══ Merchant routes ═══
			merchant := authed.Group("/merchant")
			merchant.Use(middleware.MerchantOnly())
			{
				merchant.GET("/daily-report", handlers.MerchantDailyReport)
				merchant.GET("/appointments", handlers.MerchantAppointments)
				merchant.GET("/orders", handlers.MerchantOrders)
				merchant.GET("/orders/stats", handlers.MerchantStats)
				merchant.GET("/hot-tags", handlers.MerchantHotTags)
				merchant.GET("/stats", handlers.MerchantStats)
			}
		}

		// ═══ Mock data dump (dev only) ═══
		api.GET("/mock/all", handlers.DumpMockData)
	}

	return r
}
