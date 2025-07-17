import { useRef, useState, useEffect } from "react";
import { FaCamera, FaUpload, FaTrash } from "react-icons/fa";
import Cropper from "react-easy-crop";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  updateProfileImage,
  fetchProfileImage,
  deleteProfileImage,
} from "@/redux/slices/profileImageSlice";

import { getCroppedImg } from "@/lib/utils";
import { Button } from "../ui/button";
import Image from "next/image";
import { LuPencil } from "react-icons/lu";
import { RxCross2 } from "react-icons/rx";
import { InitialsAvatar } from "@/lib/InitialsAvatar";
import { useUploader } from "@/hooks/useUploader";

interface ProfileImageCropperProps {
  profileImage?: string;
  userName?: string;
}

export function ProfileImageCropper({
  profileImage,
  userName,
}: ProfileImageCropperProps) {
  const dispatch = useAppDispatch();
  const { isUploading, uploadFile } = useUploader();
  const {
    isLoading,
    error,
    profileImage: reduxProfileImage,
  } = useAppSelector((state) => state.profileImage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchProfileImage());
  }, [dispatch]);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalError(null);
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTakePhoto = () => {
    alert("Camera capture not implemented in this demo. Use Upload instead.");
  };

  const handleRemovePhoto = async () => {
    setLocalError(null);
    try {
      await dispatch(deleteProfileImage()).unwrap();
      setShowModal(false);
    } catch (err: any) {
      setLocalError("Failed to remove profile image.");
      console.log(err);
    }
  };

  const onCropComplete = (_: any, croppedAreaPixels: any) =>
    setCroppedAreaPixels(croppedAreaPixels);

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setLocalError(null);
    try {
      const croppedBlob = (await getCroppedImg(
        imageSrc,
        croppedAreaPixels
      )) as Blob;
      const croppedFile = new File([croppedBlob], "profile.jpg", {
        type: "image/jpeg",
      });

      const uploadResult = await uploadFile(croppedFile, "profile-images");
      if (!uploadResult) {
        setLocalError("Failed to upload image.");
        return;
      }

      await dispatch(
        updateProfileImage({ profileImage: uploadResult.secure_url })
      );
      setShowCropper(false);
      setShowModal(false);
    } catch (err: any) {
      setLocalError("Failed to upload or update profile image.");
      console.log(err);
    }
  };

  const displayImage = reduxProfileImage || profileImage;

  return (
    <div className="relative md:w-28 md:h-28 w-20 h-20 flex items-center justify-center group">
      {/* Outer border ring */}
      <div className="absolute inset-0 rounded-full md:border-4 border-white dark:border-black pointer-events-none" />
      {/* Gap between border and image */}
      <div className="relative md:w-24 md:h-24 w-16 h-16 rounded-full  dark:bg-zinc-900 flex items-center justify-center">
        {displayImage ? (
          <Image
            src={displayImage}
            alt="Profile"
            width={96}
            height={96}
            className="md:w-24 md:h-24 w-16 h-16 rounded-full object-cover transition duration-200 cursor-pointer"
          />
        ) : (
          <>
            <div className="hidden md:block">
              <InitialsAvatar
                name={userName}
                size={96}
                className="md:w-24 md:h-24 w-16 h-16 rounded-full object-cover transition duration-200 cursor-pointer"
              />
            </div>
            <div className="block md:hidden">
              <InitialsAvatar
                name={userName}
                size={64}
                className="md:w-24 md:h-24 w-16 h-16 rounded-full object-cover transition duration-200 cursor-pointer"
              />
            </div>
          </>
        )}

        {/* Pencil icon, only on hover */}
        <button
          type="button"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80   dark:border-zinc-800 rounded-full w-full h-full cursor-pointer flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition"
          onClick={() => setShowModal(true)}
          aria-label="Edit profile image"
        >
          <LuPencil className="text-white text-xl" />
        </button>
      </div>
      {/* Modal for profile image actions */}
      {/* {true && ( */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 dark:bg-black/80">
          <div className="bg-white dark:bg-zinc-900 rounded-sm w-full max-w-2xl flex flex-col relative overflow-hidden">
            {/* Top bar */}
            <div className="flex items-center justify-between p-3 pl-5 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Profile photo
              </span>
              <div
                className="cursor-pointer  p-2 rounded-full  text-red-400 hover:bg-red-50 "
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                <RxCross2 />
              </div>
            </div>
            {/* Large profile image */}
            <div className="flex flex-col items-center justify-center py-6 px-4 ">
              <div className="relative ">
                {displayImage ? (
                  <Image
                    src={displayImage}
                    alt="Profile Large"
                    width={350}
                    height={350}
                    className="rounded-full object-cover border-4 border-white  shadow"
                  />
                ) : (
                  <InitialsAvatar
                    name={userName}
                    size={350}
                    className="rounded-full object-cover border-4 border-white  shadow"
                  />
                )}
              </div>
            </div>
            {showCropper && imageSrc && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                <div className="bg-white dark:bg-zinc-900 p-4 rounded shadow-lg relative">
                  <div className="w-72 h-72 relative">
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      onClick={() => setShowCropper(false)}
                      type="button"
                      disabled={isUploading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      type="button"
                      disabled={isUploading}
                    >
                      {isUploading ? "Saving..." : "Save"}
                    </Button>
                  </div>
                  {(localError || error) && (
                    <div className="text-red-500 text-sm mt-2">
                      {localError || error}
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="w-full flex justify-between items-center px-6 py-1 bg-zinc-100 dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700 gap-2">
              <div className="flex items-center gap-2">
                <button
                  className="flex flex-col items-center gap-1 mx-1  cursor-pointer  p-2 py-3 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  onClick={handleUploadClick}
                  disabled={isUploading}
                >
                  <FaUpload className="text-lg mb-1" />
                  <span className="text-xs">Change photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </button>
                <button
                  className="flex flex-col items-center gap-1 mx-1  cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 p-2 py-3 rounded-md"
                  onClick={handleTakePhoto}
                  disabled={isUploading}
                >
                  <FaCamera className="text-lg mb-1" />
                  <span className="text-xs">Take photo</span>
                </button>
              </div>
              <button
                className="flex flex-col items-center gap-1 mx-1  cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 p-2 py-3 rounded-md"
                onClick={handleRemovePhoto}
                disabled={isUploading}
              >
                <FaTrash className="text-lg mb-1 text-red-400" />
                <span className="text-xs text-red-400">Remove photo</span>
              </button>
            </div>
            {(localError || error) && !showCropper && (
              <div className="text-red-500 text-sm mt-2 text-center">
                {localError || error}
              </div>
            )}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-black/60 z-30">
                <span className="text-blue-600 font-semibold">Updating...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
