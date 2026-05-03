import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileSearchTriggerProps {
  onClick: () => void;
}

export const MobileSearchTrigger = ({ onClick }: MobileSearchTriggerProps) => (
  <div className="lg:hidden">
    <Button
      onClick={onClick}
      variant="outline"
      className="w-full h-14 rounded-2xl border-2 border-gray-200 bg-white/95 backdrop-blur-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 justify-start text-left text-gray-600 hover:bg-gray-50 hover:border-primary/20"
    >
      <Search className="w-5 h-5 mr-3 opacity-60" />
      <span className="text-base font-medium">Search destinations...</span>
    </Button>
  </div>
);
