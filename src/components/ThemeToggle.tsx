import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get theme from localStorage or default to system
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (storedTheme) {
      setTheme(storedTheme);
      applyTheme(storedTheme);
    } else {
      // Check system preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemTheme = isDark ? 'dark' : 'light';
      applyTheme('system');
    }
  }, []);

  const applyTheme = (selectedTheme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    let isDark = false;

    if (selectedTheme === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      isDark = selectedTheme === 'dark';
    }

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem('theme', selectedTheme);
  };

  const handleThemeChange = (selectedTheme: 'light' | 'dark' | 'system') => {
    setTheme(selectedTheme);
    applyTheme(selectedTheme);
  };

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        disabled
        aria-label="Toggle theme"
      >
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Toggle theme"
        >
          {theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleThemeChange('light')}
          className={theme === 'light' ? 'bg-primary/20' : ''}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange('dark')}
          className={theme === 'dark' ? 'bg-primary/20' : ''}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange('system')}
          className={theme === 'system' ? 'bg-primary/20' : ''}
        >
          <span className="mr-2">💻</span>
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
