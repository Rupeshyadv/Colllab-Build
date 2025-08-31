import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const upload_on_cloudinary = async (local_file_path) => {
    try {
        if(!local_file_path) {
            console.log("local file path is absent!")
            return null
        }

        console.log("📤 Uploading to Cloudinary:", local_file_path);

        const response = await cloudinary.uploader.upload(
            local_file_path, 
            {
                resource_type: "auto"
            }
        )

        console.log("✅ Cloudinary Upload Success:", response.secure_url)
        
        if (fs.existsSync(local_file_path)) {
            fs.unlinkSync(local_file_path)
        }

        return response
    } catch(error) {
        fs.unlinkSync(local_file_path)
        return null
    }
}

export { upload_on_cloudinary }