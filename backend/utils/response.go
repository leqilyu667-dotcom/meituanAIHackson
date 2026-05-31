package utils

import "github.com/gin-gonic/gin"

type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

type PageData struct {
	List     interface{} `json:"list"`
	Total    int64       `json:"total"`
	Page     int         `json:"page"`
	PageSize int         `json:"page_size"`
}

func Success(c *gin.Context, data interface{}) {
	c.JSON(200, Response{Code: 0, Message: "ok", Data: data})
}

func Created(c *gin.Context, data interface{}) {
	c.JSON(201, Response{Code: 0, Message: "created", Data: data})
}

func Error(c *gin.Context, code int, msg string) {
	c.JSON(code, Response{Code: code, Message: msg})
}

func Page(c *gin.Context, list interface{}, total int64, page, pageSize int) {
	c.JSON(200, Response{Code: 0, Message: "ok", Data: PageData{
		List: list, Total: total, Page: page, PageSize: pageSize,
	}})
}
