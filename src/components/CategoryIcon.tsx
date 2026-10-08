import React from 'react';
import { 
  HeartHandshake, 
  Zap, 
  Home, 
  Lightbulb, 
  Wrench, 
  Utensils, 
  Train, 
  Wifi, 
  ShoppingBag, 
  CreditCard, 
  TrendingUp, 
  Tag, 
  Coffee, 
  Car, 
  Film, 
  Gift 
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  color?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', color }) => {
  const iconProps = {
    className,
    style: color ? { color } : undefined,
  };

  switch (name) {
    case 'HeartHandshake':
      return <HeartHandshake {...iconProps} />;
    case 'Zap':
      return <Zap {...iconProps} />;
    case 'Home':
      return <Home {...iconProps} />;
    case 'Lightbulb':
      return <Lightbulb {...iconProps} />;
    case 'Wrench':
      return <Wrench {...iconProps} />;
    case 'Utensils':
      return <Utensils {...iconProps} />;
    case 'Train':
      return <Train {...iconProps} />;
    case 'Wifi':
      return <Wifi {...iconProps} />;
    case 'ShoppingBag':
      return <ShoppingBag {...iconProps} />;
    case 'CreditCard':
      return <CreditCard {...iconProps} />;
    case 'TrendingUp':
      return <TrendingUp {...iconProps} />;
    case 'Coffee':
      return <Coffee {...iconProps} />;
    case 'Car':
      return <Car {...iconProps} />;
    case 'Film':
      return <Film {...iconProps} />;
    case 'Gift':
      return <Gift {...iconProps} />;
    default:
      return <Tag {...iconProps} />;
  }
};
