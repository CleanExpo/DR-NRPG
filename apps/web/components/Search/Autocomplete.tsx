'use client';

/**
 * Autocomplete Component
 *
 * Algolia-powered autocomplete with suggestions
 * Shows trending searches and recent queries
 */

import React from 'react';
import { useAutocomplete, UseAutocompleteProps } from 'react-instantsearch';
import { Search, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useRouter } from 'next/navigation';

interface AutocompleteProps extends UseAutocompleteProps {
  placeholder?: string;
  className?: string;
  onSelect?: (item: any) => void;
}

export function Autocomplete({
  placeholder = 'Search...',
  className = '',
  onSelect,
  ...props
}: AutocompleteProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const { currentRefinement = '', refine, indices } = useAutocomplete(props);

  const handleSelect = (item: any) => {
    if (onSelect) {
      onSelect(item);
    } else {
      // Default behavior: navigate to the item's URL
      if (item.url) {
        router.push(item.url);
      }
    }
    setOpen(false);
  };

  const handleInputChange = (value: string) => {
    refine(value);
    setOpen(value.length > 0);
  };

  const handleSearch = () => {
    if (currentRefinement) {
      router.push(`/search?q=${encodeURIComponent(currentRefinement)}`);
      setOpen(false);
    }
  };

  // Sample trending searches (in production, fetch from analytics)
  const trendingSearches = [
    'water damage emergency',
    'fire restoration',
    'mould removal',
    'smoke damage',
  ];

  // Sample recent searches (in production, fetch from localStorage or user session)
  const recentSearches = [
    'flood cleanup Sydney',
    'emergency restoration',
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={`relative ${className}`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            value={currentRefinement}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            placeholder={placeholder}
            className="pl-10"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        sideOffset={4}
      >
        <Command>
          <CommandList>
            {currentRefinement.length === 0 ? (
              // Show suggestions when no query
              <>
                {recentSearches.length > 0 && (
                  <CommandGroup heading="Recent Searches">
                    {recentSearches.map((search) => (
                      <CommandItem
                        key={search}
                        onSelect={() => {
                          handleInputChange(search);
                          handleSearch();
                        }}
                      >
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{search}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {trendingSearches.length > 0 && (
                  <CommandGroup heading="Trending Searches">
                    {trendingSearches.map((search) => (
                      <CommandItem
                        key={search}
                        onSelect={() => {
                          handleInputChange(search);
                          handleSearch();
                        }}
                      >
                        <TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{search}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            ) : (
              // Show search results
              <>
                {indices.map((index) => {
                  const hits = index.hits.slice(0, 5);
                  if (hits.length === 0) return null;

                  return (
                    <CommandGroup key={index.indexId} heading={getIndexLabel(index.indexId)}>
                      {hits.map((hit: any) => (
                        <CommandItem
                          key={hit.objectID}
                          onSelect={() => handleSelect(hit)}
                        >
                          <div className="flex-1">
                            <div className="font-medium">{hit.title || hit.businessName}</div>
                            {hit.description && (
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {hit.description}
                              </div>
                            )}
                          </div>
                          <ArrowRight className="ml-2 h-4 w-4 text-muted-foreground" />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  );
                })}
                {indices.every((index) => index.hits.length === 0) && (
                  <CommandEmpty>No results found</CommandEmpty>
                )}
                {/* View all results option */}
                <CommandGroup>
                  <CommandItem onSelect={handleSearch}>
                    <Search className="mr-2 h-4 w-4" />
                    <span>View all results for "{currentRefinement}"</span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function getIndexLabel(indexId: string): string {
  if (indexId.includes('content')) return 'Articles & Guides';
  if (indexId.includes('locations')) return 'Locations';
  if (indexId.includes('contractors')) return 'Contractors';
  return 'Results';
}
