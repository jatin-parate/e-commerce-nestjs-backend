import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private readonly s3: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(configService: ConfigService) {
    this.bucketName = configService.get<string>('AWS_S3_BUCKET')!;
    this.region = configService.get<string>('AWS_S3_REGION')!;
    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: configService.get<string>('AWS_ACCESS_KEY')!,
        secretAccessKey: configService.get<string>('AWS_SECRET')!,
      },
    });
  }

  generateUrl(key: string) {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async upload(buffer: Buffer, filepath: string): Promise<void> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: filepath,
        Body: buffer,
      }),
    );
  }
}
