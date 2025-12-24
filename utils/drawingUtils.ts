import React from 'react';
import { CANVAS_SIZE } from '../types';

export const getCoordinates = (
  event: React.PointerEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement
) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = CANVAS_SIZE / rect.width;
  const scaleY = CANVAS_SIZE / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
};

// Stack-based Flood Fill Algorithm (Recursive is too risky for JS call stack)
export const floodFill = (
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColor: string
) => {
  // Parse fill color
  const tempCtx = document.createElement('canvas').getContext('2d');
  if (!tempCtx) return;
  tempCtx.fillStyle = fillColor;
  tempCtx.fillRect(0, 0, 1, 1);
  const fillData = tempCtx.getImageData(0, 0, 1, 1).data;

  const imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  const data = imageData.data;
  
  // Get target color
  const pixelPos = (Math.floor(startY) * CANVAS_SIZE + Math.floor(startX)) * 4;
  const targetR = data[pixelPos];
  const targetG = data[pixelPos + 1];
  const targetB = data[pixelPos + 2];
  const targetA = data[pixelPos + 3];

  // If match, return
  if (
    targetR === fillData[0] &&
    targetG === fillData[1] &&
    targetB === fillData[2] &&
    targetA === fillData[3]
  ) {
    return;
  }

  const matchStartColor = (pos: number) => {
    return (
      data[pos] === targetR &&
      data[pos + 1] === targetG &&
      data[pos + 2] === targetB &&
      data[pos + 3] === targetA
    );
  };

  const colorPixel = (pos: number) => {
    data[pos] = fillData[0];
    data[pos + 1] = fillData[1];
    data[pos + 2] = fillData[2];
    data[pos + 3] = fillData[3];
  };

  const stack: [number, number][] = [[Math.floor(startX), Math.floor(startY)]];

  while (stack.length) {
    const [x, y] = stack.pop()!;
    let pixelPos = (y * CANVAS_SIZE + x) * 4;

    let y1 = y;
    while (y1 >= 0 && matchStartColor(pixelPos)) {
      y1--;
      pixelPos -= CANVAS_SIZE * 4;
    }
    y1++;
    pixelPos += CANVAS_SIZE * 4;

    let spanLeft = false;
    let spanRight = false;

    while (y1 < CANVAS_SIZE && matchStartColor(pixelPos)) {
      colorPixel(pixelPos);

      if (!spanLeft && x > 0 && matchStartColor(pixelPos - 4)) {
        stack.push([x - 1, y1]);
        spanLeft = true;
      } else if (spanLeft && x > 0 && !matchStartColor(pixelPos - 4)) {
        spanLeft = false;
      }

      if (!spanRight && x < CANVAS_SIZE - 1 && matchStartColor(pixelPos + 4)) {
        stack.push([x + 1, y1]);
        spanRight = true;
      } else if (spanRight && x < CANVAS_SIZE - 1 && !matchStartColor(pixelPos + 4)) {
        spanRight = false;
      }

      y1++;
      pixelPos += CANVAS_SIZE * 4;
    }
  }

  ctx.putImageData(imageData, 0, 0);
};