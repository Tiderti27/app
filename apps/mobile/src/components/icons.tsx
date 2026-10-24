import Svg, { Circle, Path, Rect } from "react-native-svg";

interface IconProps {
  size?: number;
  color: string;
}

const STROKE = { strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function PinIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 21s7-7.5 7-12a7 7 0 1 0-14 0c0 4.5 7 12 7 12z" stroke={color} {...STROKE} />
      <Circle cx={12} cy={9} r={2.5} stroke={color} {...STROKE} />
    </Svg>
  );
}

export function FlagIcon({ size = 18, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 21V4m0 0h12l-2.5 4L17 12H5" stroke={color} {...STROKE} />
    </Svg>
  );
}

export function GiftIcon({ size = 18, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={8} width={18} height={13} rx={1.5} stroke={color} {...STROKE} />
      <Path d="M3 12h18M12 8v13" stroke={color} {...STROKE} />
      <Path
        d="M12 8c-2-3-6-3-6-.5C6 9 9 8 12 8zM12 8c2-3 6-3 6-.5C18 9 15 8 12 8z"
        stroke={color}
        {...STROKE}
      />
    </Svg>
  );
}

export function SearchIcon({ size = 18, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={7} stroke={color} {...STROKE} />
      <Path d="M20 20l-4.3-4.3" stroke={color} {...STROKE} />
    </Svg>
  );
}

export function SortIcon({ size = 15, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3" stroke={color} {...STROKE} />
    </Svg>
  );
}

export function MailIcon({ size = 18, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={5} width={18} height={14} rx={2.5} stroke={color} {...STROKE} />
      <Path d="M3 7.5l9 6 9-6" stroke={color} {...STROKE} />
    </Svg>
  );
}

export function LockIcon({ size = 18, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={5} y={10} width={14} height={10} rx={2.5} stroke={color} {...STROKE} />
      <Path d="M8 10V7a4 4 0 0 1 8 0v3" stroke={color} {...STROKE} />
    </Svg>
  );
}

export function HeartIcon({ size = 24, color, filled = false }: IconProps & { filled?: boolean }) {
  const d = "M12 20s-7.5-4.6-10-9.3C.6 7.8 2 4 5.6 4c2 0 3.4 1 4.4 2.4C11 5 12.4 4 14.4 4 18 4 19.4 7.8 18 10.7 16.5 15.4 12 20 12 20z";
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : "none"}>
      <Path d={d} stroke={color} {...STROKE} />
    </Svg>
  );
}

export function BackIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 18l-6-6 6-6" stroke={color} {...STROKE} />
    </Svg>
  );
}

export function ArrowRightIcon({ size = 17, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14M13 6l6 6-6 6" stroke={color} {...STROKE} />
    </Svg>
  );
}

export function ClockIcon({ size = 15, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} {...STROKE} />
      <Path d="M12 7v5l3 3" stroke={color} {...STROKE} />
    </Svg>
  );
}

export function LocationIcon({ size = 14, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 21s7-7.5 7-12a7 7 0 1 0-14 0c0 4.5 7 12 7 12z" stroke={color} {...STROKE} />
      <Circle cx={12} cy={9} r={2} stroke={color} {...STROKE} />
    </Svg>
  );
}

export function PlayIcon({ size = 22, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M8 5v14l11-7z" />
    </Svg>
  );
}

export function UserIcon({ size = 20, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} stroke={color} {...STROKE} />
      <Path d="M4 20a8 8 0 0 1 16 0" stroke={color} {...STROKE} />
    </Svg>
  );
}

export function MapIcon({ size = 21, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" stroke={color} {...STROKE} />
      <Path d="M9 4v14M15 6v14" stroke={color} {...STROKE} />
    </Svg>
  );
}

export function BookmarkIcon({ size = 21, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 4h12v17l-6-4-6 4V4z" stroke={color} {...STROKE} />
    </Svg>
  );
}

// docs/spec.md Abschnitt 7.1 - eine Icon-Komponente je Kategorie
export function FoodIcon({ size = 14, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 7h12l1 13H5L6 7z" stroke={color} {...STROKE} />
      <Path d="M9 7a3 3 0 0 1 6 0" stroke={color} {...STROKE} />
    </Svg>
  );
}

export function ShoppingIcon({ size = 14, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={4} y={7} width={16} height={13} rx={2} stroke={color} {...STROKE} />
      <Path d="M8 10V6a4 4 0 0 1 8 0v4" stroke={color} {...STROKE} />
    </Svg>
  );
}

export function ExperienceIcon({ size = 14, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V9z"
        stroke={color}
        {...STROKE}
      />
    </Svg>
  );
}

export function NightlifeIcon({ size = 14, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 12.5A8.5 8.5 0 1 1 11.5 3 7 7 0 0 0 21 12.5z" stroke={color} {...STROKE} />
    </Svg>
  );
}

export function BeautyIcon({ size = 14, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" stroke={color} {...STROKE} />
    </Svg>
  );
}

export function CultureIcon({ size = 14, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 21h16M5 21V9l7-5 7 5v12M9 21v-6h6v6" stroke={color} {...STROKE} />
    </Svg>
  );
}

export function CategoryIcon({ category, size = 14, color }: IconProps & { category: string }) {
  switch (category) {
    case "food":
      return <FoodIcon size={size} color={color} />;
    case "shopping":
      return <ShoppingIcon size={size} color={color} />;
    case "experience":
      return <ExperienceIcon size={size} color={color} />;
    case "nightlife":
      return <NightlifeIcon size={size} color={color} />;
    case "beauty":
      return <BeautyIcon size={size} color={color} />;
    case "culture":
      return <CultureIcon size={size} color={color} />;
    default:
      return <PinIcon size={size} color={color} />;
  }
}
