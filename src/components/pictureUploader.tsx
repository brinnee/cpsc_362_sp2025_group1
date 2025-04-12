'use client';

import React, {useRef, useState } from 'react';
import AvatarEditor from 'react-avatar-editor';
import {auth} from '~/lib/firebase'
import {getStorage, ref, uploadBytes,getDownloadURL} from 'firebase/storage';

const user = auth.currentUser;
interface ProfilePictureUploaderProps {
    onClose: () => void;
  }
  
export default function ProfilePictureUploader({ onClose }: ProfilePictureUploaderProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null); //tells what value selectedFile will hold, starts null then file later
    const [previewUrl, setPreviewUrl] = useState('');
    const [scale, setScale] = useState<number>(1);
    const [position, setPosition] = useState({x: 0.5, y: 0.5});
    const editorRef = useRef<AvatarEditor | null> (null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { //e stands for event, "React.Change... tells TS that e.target.files is a filelist"
        if (e.target.files && e.target.files[0]){
            setSelectedFile(e.target.files[0]);
            setPreviewUrl(''); //resets preview
        }
    };

    const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
        const scaleValue = parseFloat(e.target.value);
        setScale(scaleValue);
    };

      const handlePositionChange = (pos: { x: number; y: number }) => {
        setPosition(pos);
      };

      const handlePreview = () =>{
        if(editorRef.current) {
            const canvas = editorRef.current.getImageScaledToCanvas().toDataURL();
            setPreviewUrl(canvas);
        }
      };

      const handleSave = async () => {
        console.log("clicked save");
        if (!editorRef.current) {
            console.log("No editorRef!");
            return;
          }
        if (editorRef.current) {
          const canvas = editorRef.current.getImageScaledToCanvas();
          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob((blob) => resolve(blob), 'image/png')
          );

          if (!blob) return;
          //saving to db
            const user = auth.currentUser;
          if(!user) return;

          const storage = getStorage();
          const storageRef = ref(storage, `profile_pictures/${user.uid}.png`);

          //uploading image to storage
          await uploadBytes(storageRef, blob);
          const downlaodURL = await getDownloadURL(storageRef);
          setPreviewUrl(downlaodURL);
          onClose();
        }
    };

      return (
        <div>
            <input type = "file" accept="image/*" onChange={handleFileChange} />
            <br/>
            <label>Zoom:</label>
            <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={scale}
                onChange={handleScaleChange} // ✅ correct usage
            />
            <br />
            {selectedFile && (
                <AvatarEditor
                    ref={editorRef}
                    image={selectedFile}
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
         <button
          onClick={onClose}
          className="text-gray-500 px-4 py-2 rounded border">
          Cancel
        </button>
        <button
            onClick={handleSave}
            className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Save as Profile Picture
            </button>
      </div>
      {previewUrl && <img src={previewUrl} className="mt-4 rounded-full" alt="Preview" />}
    </div>
      );
      
}

