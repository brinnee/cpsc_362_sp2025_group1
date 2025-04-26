'use client';

import React, { useRef, useState } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { auth } from '~/lib/firebase';
import { updateProfile } from 'firebase/auth';
import Image from 'next/image';
import { useAuth } from "~/auth/AuthContext";

interface ProfilePictureUploaderProps {
  onClose: () => void;
}

export default function ProfilePictureUploader({ onClose }: ProfilePictureUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 });
  const editorRef = useRef<AvatarEditor | null>(null);
  const { refreshUser } = useAuth();


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      console.log('File selected:', selected);
    }
  };

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScale(parseFloat(e.target.value));
  };

  const handlePositionChange = (pos: { x: number; y: number }) => {
    setPosition(pos);
  };

  const handlePreview = () => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas().toDataURL();
      setPreviewUrl(canvas);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      console.warn('No file selected for upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/uploadProfilePic', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        console.error('Upload failed with status:', res.status);
        return;
      }

      type UploadResponse = {
        url: string;
      };

      const data: UploadResponse = await res.json();

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          photoURL: data.url,
        });

        await auth.currentUser.reload();
        await refreshUser();
        console.log('Profile picture set:', auth.currentUser.photoURL);
        onClose();
      } else {
        console.error('No authenticated user.');
      }
    } catch (err) {
      console.error('handleUpload error:', err);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <br />
      <label>Zoom:</label>
      <input
        type="range"
        min="1"
        max="3"
        step="0.1"
        value={scale}
        onChange={handleScaleChange}
      />
      <br />

      {file && (
        <AvatarEditor
          ref={editorRef}
          image={file}
          width={300}
          height={300}
          border={50}
          borderRadius={150}
          scale={scale}
          position={position}
          onPositionChange={handlePositionChange}
        />
      )}

      <div className="mt-4 flex gap-2">
        <button onClick={handlePreview} className="bg-blue-500 text-white px-4 py-2 rounded">
          Preview
        </button>
        <button onClick={onClose} className="text-gray-500 px-4 py-2 rounded border">
          Cancel
        </button>
        <button
          onClick={() => {
            console.log('BUTTON CLICKED');
            void handleUpload(); // `void` prevents unhandled-promise warning
          }}
          className="bg-green-500 text-white px-4 py-2 rounded mt-2"
        >
          Upload Profile Picture
        </button>
      </div>

      {previewUrl && (
        <div className="mt-4 rounded-full overflow-hidden w-[300px] h-[300px] relative">
          <Image src={previewUrl} alt="Preview" fill />
        </div>
      )}
    </div>
  );
}
