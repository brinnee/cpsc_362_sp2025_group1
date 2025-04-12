// src/types/react-avatar-editor.d.ts

declare module 'react-avatar-editor' {
    import * as React from 'react';
  
    export interface AvatarEditorProps {
      image: string | File;
      width: number;
      height: number;
      border?: number;
      color?: [number, number, number, number];
      scale?: number;
      rotate?: number;
      style?: React.CSSProperties;
      className?: string;
      borderRadius?: number;
      backgroundColor?: string;
      position?: {x: number; y:number};
      onPositionChange?: (position:{x: number;y:number}) =>void;
      onImageChange?: () => void;
      onLoadFailure?: (event: Event) => void;
      onLoadSuccess?: (imgInfo: { width: number; height: number }) => void;
    }
  
    export default class AvatarEditor extends React.Component<AvatarEditorProps> {
      getImage(): HTMLCanvasElement;
      getImageScaledToCanvas(): HTMLCanvasElement;
    }
  }
  