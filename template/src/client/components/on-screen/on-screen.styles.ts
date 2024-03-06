import styled, { keyframes } from 'styled-components';

const rotate = keyframes`
      from {transform: rotate(0deg);}
      to {transform: rotate(360deg);}
`;

export const ButtonGear = styled.div`
  width: 56px;
  height: 56px;
  top: 30px;
  left: 30px;
  position: fixed;
  display: inline-flex;
  justify-content: center;
  z-index: 10000;
  color: #fff;
  background-color: #303f9f;
  box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.14),
    0 1px 18px 0 rgba(0, 0, 0, 0.12);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    visibility 0.2s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const GearLabel = styled.span`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: ${rotate} 1.5s infinite;
`;

export const DivInfo = styled.div<{
  $top: number;
  $left: number;
  $width: number;
  $height: number;
}>`
  position: absolute;
  box-sizing: border-box;
  border-color: rgb(255, 153, 0);
  border-style: dashed;
  border-width: 1px;
  top: ${props => props.$top}px;
  left: ${props => props.$left}px;
  width: ${props => props.$width}px;
  height: ${props => props.$height}px;
`;
