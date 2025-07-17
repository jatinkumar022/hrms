import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

interface UploadResult {
  secure_url: string;
}

export function useUploader() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (
    file: File,
    folder: string
  ): Promise<UploadResult | null> => {
    if (!file) return null;

    setIsUploading(true);
    try {
      // 1. Get signature for all parameters
      const timestamp = Math.round(new Date().getTime() / 1000);
      const paramsToSign = {
        timestamp: timestamp,
        folder: folder,
      };

      const signatureResponse = await axios.post("/api/upload/signature", {
        paramsToSign,
      });
      const { signature, api_key, cloud_name } = signatureResponse.data;

      // 2. Upload directly to Cloudinary with all signed parameters
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", api_key);
      formData.append("timestamp", timestamp.toString());
      formData.append("folder", folder);
      formData.append("signature", signature);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`;
      const uploadResponse = await axios.post<UploadResult>(
        cloudinaryUrl,
        formData
      );

      const { secure_url } = uploadResponse.data;

      // 3. Confirm upload with your backend
      await axios.post(
        "/api/upload",
        { secure_url },
        { headers: { "Content-Type": "application/json" } }
      );

      return { secure_url };
    } catch (error) {
      toast.error("File upload failed. Please try again.");
      console.error("Upload error in useUploader:", error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { isUploading, uploadFile };
}
