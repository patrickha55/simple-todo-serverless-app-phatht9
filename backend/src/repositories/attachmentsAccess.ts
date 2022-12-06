import * as AWS from 'aws-sdk';
import { config } from "../utils/config";

export class AttachmentsAccess {
    private readonly bucketName: string;
    private readonly urlExpiration: number;
    private readonly s3: AWS.S3;

    constructor() {
        this.bucketName = config.ATTACHMENT_S3_BUCKET;
        this.urlExpiration = parseInt(config.URL_EXPIRATION);
        this.s3 = new AWS.S3({
            signatureVersion: 'v4'
        });
    }

    /** Create a presigned url of the attachments s3 bucket. */
    createAttachmentPresignedUrl = (todoId: string): string => {
        return this.s3.getSignedUrl("putObject", {
            Bucket: this.bucketName,
            Key: todoId,
            Expires: this.urlExpiration
        });
    };
}