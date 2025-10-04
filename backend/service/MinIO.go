package service

import (
	"context"
	"fmt"
	"log"
	"mime/multipart"
	"net/http"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type MinIOService struct {
	Client     *minio.Client
	BucketName string
	Endpoint   string
}

func NewMinIOService(endpoint, accessKey, secretKey, BucketName string, useSSL bool) *MinIOService {
	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: useSSL,
	})

	if err != nil {
		log.Fatalf("Failed to initialize Minio client: %v", err)
	}

	ctx := context.Background()
	exists, err := client.BucketExists(ctx, BucketName)
	if err != nil {
		log.Fatalf("error checking bucket: %v", err)
	}
	if !exists {
		err = client.MakeBucket(ctx, BucketName, minio.MakeBucketOptions{})
		if err != nil {
			log.Fatalf("failed to reate bucket: %v", err)
		}
	}
	return &MinIOService{
		Client:     client,
		BucketName: BucketName,
	}
}

func (s *MinIOService) GetPublicURL(objectName string) string {
	return fmt.Sprintf("%s/%s/%s", s.Endpoint, s.BucketName, objectName)
}

func (m *MinIOService) UploadImage(Id string, file multipart.File, fileHeader *multipart.FileHeader) (string, error) {
	ctx := context.Background()
	objectName := Id
	buffer := make([]byte, 512)
	_, err := file.Read(buffer)
	if err != nil {
		return "", err
	}
	file.Seek(0, 0)
	contentType := http.DetectContentType(buffer)
	fmt.Println("detected content type: ", contentType)

	_, err = m.Client.PutObject(ctx, m.BucketName, objectName, file, fileHeader.Size, minio.PutObjectOptions{
		ContentType: contentType,
	})

	if err != nil {
		return "", err
	}

	url := fmt.Sprintf("%s/%s/%s", m.Endpoint, m.BucketName, objectName)
	return url, nil
}
