
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X, PlusCircle, UserPlus, DollarSign } from 'react-feather';
import { cn } from '@/lib/utils';

interface SpeedDialAction {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick?: () => void;
}

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleOpen = () => setIsOpen(!isOpen);

  const actions: SpeedDialAction[] = [
    {
      id: 'fab-new-booking',
      label: 'New Booking',
      icon: PlusCircle,
      onClick: () => {
        window.dispatchEvent(new CustomEvent('fabOpenNewBookingDialog'));
      },
    },
    {
      id: 'fab-new-client',
      label: 'New Client',
      icon: UserPlus,
      onClick: () => {
        window.dispatchEvent(new CustomEvent('fabOpenNewClientDialog'));
      },
    },
    {
      id: 'fab-new-payment',
      label: 'New Payment',
      icon: DollarSign,
      onClick: () => {
        window.dispatchEvent(new CustomEvent('fabOpenRecordPaymentDialog'));
      },
    },
  ];

  if (!isMounted) {
    return null; 
  }

  return (
    <div className="relative flex flex-col items-center gap-2">
      {/* Speed Dial Actions */}
      <div
        className={cn(
          'flex flex-col items-center gap-2 transition-all duration-300 ease-in-out',
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        )}
      >
        {actions.map((action) => (
          <div key={action.id} className="group relative flex items-center">
            <span
              className={cn(
                'absolute right-full mr-3 whitespace-nowrap rounded-md bg-card px-2 py-1 text-sm text-card-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100',
                !isOpen && 'hidden' 
              )}
            >
              {action.label}
            </span>
            <Button
              variant="default"
              size="icon"
              className="rounded-full h-12 w-12 shadow-lg bg-secondary text-secondary-foreground hover:bg-secondary/90"
              onClick={() => {
                action.onClick?.();
                setIsOpen(false); 
              }}
              aria-label={action.label}
            >
              <action.icon className="h-6 w-6" />
            </Button>
          </div>
        ))}
      </div>

      {/* Main FAB Button */}
      <Button
        variant="default"
        size="icon"
        className="rounded-full h-16 w-16 shadow-xl hover:bg-primary/90 relative"
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close actions' : 'Open actions'}
      >
        <Plus
          className={cn(
            'h-8 w-8 transition-all duration-300 ease-in-out',
            isOpen ? 'rotate-45 opacity-0' : 'rotate-0 opacity-100'
          )}
        />
        <X
          className={cn(
            'h-8 w-8 absolute transition-all duration-300 ease-in-out',
            isOpen ? 'rotate-0 opacity-100' : '-rotate-45 opacity-0'
          )}
        />
      </Button>
    </div>
  );
}
