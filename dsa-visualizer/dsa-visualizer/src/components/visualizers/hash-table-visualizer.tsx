"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  RotateCcw, 
  Plus, 
  Search, 
  Trash2,
  Hash,
  ArrowRight
} from 'lucide-react';

interface HashEntry {
  key: string;
  value: string;
  hash: number;
  isHighlighted?: boolean;
  isCollision?: boolean;
}

interface HashTable {
  table: (HashEntry | null)[][];
  size: number;
  loadFactor: number;
}

const HashTableVisualizer = () => {
  const [hashTable, setHashTable] = useState<HashTable>({
    table: Array(7).fill(null).map(() => []),
    size: 7,
    loadFactor: 0
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [inputKey, setInputKey] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const [currentStep, setCurrentStep] = useState('');
  const [hashFunction, setHashFunction] = useState<'division' | 'multiplication'>('division');
  const [collisionResolution, setCollisionResolution] = useState<'chaining' | 'linear' | 'quadratic'>('chaining');

  // Hash function implementations
  const hashFunctions = {
    division: (key: string, tableSize: number): number => {
      let hash = 0;
      for (let i = 0; i < key.length; i++) {
        hash += key.charCodeAt(i);
      }
      return hash % tableSize;
    },
    multiplication: (key: string, tableSize: number): number => {
      const A = 0.6180339887; // (√5 - 1) / 2
      let hash = 0;
      for (let i = 0; i < key.length; i++) {
        hash += key.charCodeAt(i);
      }
      return Math.floor(tableSize * ((hash * A) % 1));
    }
  };

  const calculateHash = (key: string): number => {
    return hashFunctions[hashFunction](key, hashTable.size);
  };

  const reset = () => {
    setHashTable({
      table: Array(hashTable.size).fill(null).map(() => []),
      size: hashTable.size,
      loadFactor: 0
    });
    setCurrentStep('Hash table reset');
  };

  const insert = async (key: string, value: string) => {
    if (!key.trim() || !value.trim()) return;

    setIsAnimating(true);
    setCurrentStep(`Inserting key: "${key}" with value: "${value}"`);

    const hash = calculateHash(key);
    setCurrentStep(`Hash function result: ${hash}`);

    await new Promise(resolve => setTimeout(resolve, speed));

    const newTable = { ...hashTable };
    
    if (collisionResolution === 'chaining') {
      // Check if key already exists in the chain
      const existingIndex = newTable.table[hash].findIndex(entry => entry && entry.key === key);
      
      if (existingIndex !== -1) {
        // Update existing entry
        newTable.table[hash][existingIndex] = { key, value, hash, isHighlighted: true };
        setCurrentStep(`Updated existing key "${key}" at index ${hash}`);
      } else {
        // Add to chain
        const isCollision = newTable.table[hash].length > 0;
        newTable.table[hash].push({ 
          key, 
          value, 
          hash, 
          isHighlighted: true, 
          isCollision 
        });
        
        if (isCollision) {
          setCurrentStep(`Collision detected! Added to chain at index ${hash}`);
        } else {
          setCurrentStep(`Successfully inserted at index ${hash}`);
        }
      }
    } else {
      // Linear or quadratic probing
      let index = hash;
      let probe = 0;
      
      while (newTable.table[index].length > 0) {
        if (collisionResolution === 'linear') {
          index = (hash + probe + 1) % newTable.size;
        } else { // quadratic
          index = (hash + probe * probe) % newTable.size;
        }
        probe++;
        
        if (probe >= newTable.size) {
          setCurrentStep('Hash table is full!');
          setIsAnimating(false);
          return;
        }
        
        setCurrentStep(`Probing... trying index ${index}`);
        await new Promise(resolve => setTimeout(resolve, speed / 2));
      }
      
      newTable.table[index] = [{ key, value, hash: index, isHighlighted: true }];
      setCurrentStep(`Inserted at index ${index} after ${probe} probes`);
    }

    // Calculate load factor
    const totalEntries = newTable.table.reduce((sum, chain) => sum + chain.length, 0);
    newTable.loadFactor = totalEntries / newTable.size;

    setHashTable(newTable);

    // Remove highlighting after animation
    setTimeout(() => {
      const finalTable = { ...newTable };
      finalTable.table = finalTable.table.map(chain => 
        chain.map(entry => entry ? { ...entry, isHighlighted: false } : entry)
      );
      setHashTable(finalTable);
      setIsAnimating(false);
    }, speed);
  };

  const search = async (key: string) => {
    if (!key.trim()) return;

    setIsAnimating(true);
    setCurrentStep(`Searching for key: "${key}"`);

    const hash = calculateHash(key);
    setCurrentStep(`Hash function result: ${hash}`);

    await new Promise(resolve => setTimeout(resolve, speed));

    const newTable = { ...hashTable };
    
    if (collisionResolution === 'chaining') {
      const chain = newTable.table[hash];
      const found = chain.find(entry => entry && entry.key === key);
      
      if (found) {
        // Highlight found entry
        newTable.table[hash] = chain.map(entry => 
          entry && entry.key === key 
            ? { ...entry, isHighlighted: true }
            : entry
        );
        setCurrentStep(`Found "${key}" at index ${hash} with value: "${found.value}"`);
      } else {
        setCurrentStep(`Key "${key}" not found at index ${hash}`);
      }
    } else {
      // Linear or quadratic probing search
      let index = hash;
      let probe = 0;
      let found = false;
      
      while (probe < newTable.size) {
        const chain = newTable.table[index];
        
        if (chain.length === 0) {
          setCurrentStep(`Key "${key}" not found (empty slot at index ${index})`);
          break;
        }
        
        const entry = chain[0]; // In probing, each slot has at most one entry
        if (entry && entry.key === key) {
          newTable.table[index] = [{ ...entry, isHighlighted: true }];
          setCurrentStep(`Found "${key}" at index ${index} with value: "${entry.value}"`);
          found = true;
          break;
        }
        
        if (collisionResolution === 'linear') {
          index = (hash + probe + 1) % newTable.size;
        } else {
          index = (hash + probe * probe) % newTable.size;
        }
        probe++;
        
        setCurrentStep(`Probing... checking index ${index}`);
        await new Promise(resolve => setTimeout(resolve, speed / 2));
      }
      
      if (!found && probe >= newTable.size) {
        setCurrentStep(`Key "${key}" not found after checking all slots`);
      }
    }

    setHashTable(newTable);

    // Remove highlighting
    setTimeout(() => {
      const finalTable = { ...newTable };
      finalTable.table = finalTable.table.map(chain => 
        chain.map(entry => entry ? { ...entry, isHighlighted: false } : entry)
      );
      setHashTable(finalTable);
      setIsAnimating(false);
    }, speed);
  };

  const remove = async (key: string) => {
    if (!key.trim()) return;

    setIsAnimating(true);
    setCurrentStep(`Removing key: "${key}"`);

    const hash = calculateHash(key);
    await new Promise(resolve => setTimeout(resolve, speed));

    const newTable = { ...hashTable };
    
    if (collisionResolution === 'chaining') {
      const chain = newTable.table[hash];
      const index = chain.findIndex(entry => entry && entry.key === key);
      
      if (index !== -1) {
        chain.splice(index, 1);
        setCurrentStep(`Removed "${key}" from index ${hash}`);
      } else {
        setCurrentStep(`Key "${key}" not found for removal`);
      }
    } else {
      // Probing removal
      let index = hash;
      let probe = 0;
      let found = false;
      
      while (probe < newTable.size && newTable.table[index].length > 0) {
        const entry = newTable.table[index][0];
        if (entry && entry.key === key) {
          newTable.table[index] = [];
          setCurrentStep(`Removed "${key}" from index ${index}`);
          found = true;
          break;
        }
        
        if (collisionResolution === 'linear') {
          index = (hash + probe + 1) % newTable.size;
        } else {
          index = (hash + probe * probe) % newTable.size;
        }
        probe++;
      }
      
      if (!found) {
        setCurrentStep(`Key "${key}" not found for removal`);
      }
    }

    // Recalculate load factor
    const totalEntries = newTable.table.reduce((sum, chain) => sum + chain.length, 0);
    newTable.loadFactor = totalEntries / newTable.size;

    setHashTable(newTable);
    setIsAnimating(false);
  };

  const resizeTable = (newSize: number) => {
    if (isAnimating) return;
    
    const oldEntries: HashEntry[] = [];
    hashTable.table.forEach(chain => {
      chain.forEach(entry => {
        if (entry) oldEntries.push(entry);
      });
    });

    const newTable: HashTable = {
      table: Array(newSize).fill(null).map(() => []),
      size: newSize,
      loadFactor: 0
    };

    // Rehash all entries
    oldEntries.forEach(entry => {
      const newHash = hashFunctions[hashFunction](entry.key, newSize);
      newTable.table[newHash].push({ ...entry, hash: newHash });
    });

    newTable.loadFactor = oldEntries.length / newSize;
    setHashTable(newTable);
    setCurrentStep(`Resized hash table to ${newSize} and rehashed all entries`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-6 h-6" />
            Hash Table Visualizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Operations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Key"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => insert(inputKey, inputValue)}
                    disabled={isAnimating}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Insert
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Search key"
                    value={searchKey}
                    onChange={(e) => setSearchKey(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => search(searchKey)}
                    disabled={isAnimating}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Search
                  </Button>
                  <Button
                    onClick={() => remove(searchKey)}
                    disabled={isAnimating}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={reset}
                    disabled={isAnimating}
                    variant="outline"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Hash Function</label>
                  <select
                    value={hashFunction}
                    onChange={(e) => setHashFunction(e.target.value as 'division' | 'multiplication')}
                    className="w-full mt-1 p-2 border rounded"
                  >
                    <option value="division">Division Method</option>
                    <option value="multiplication">Multiplication Method</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Collision Resolution</label>
                  <select
                    value={collisionResolution}
                    onChange={(e) => setCollisionResolution(e.target.value as 'chaining' | 'linear' | 'quadratic')}
                    className="w-full mt-1 p-2 border rounded"
                  >
                    <option value="chaining">Separate Chaining</option>
                    <option value="linear">Linear Probing</option>
                    <option value="quadratic">Quadratic Probing</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Table Size</label>
                  <div className="flex gap-2 mt-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => resizeTable(7)}
                      disabled={isAnimating}
                    >
                      7
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => resizeTable(11)}
                      disabled={isAnimating}
                    >
                      11
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => resizeTable(17)}
                      disabled={isAnimating}
                    >
                      17
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Animation Speed</label>
                  <Slider
                    value={[speed]}
                    onValueChange={(value) => setSpeed(2100 - value[0])}
                    max={2000}
                    min={100}
                    step={100}
                    className="mt-2"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Speed: {Math.round((2100 - speed) / 200 * 10) / 10}x
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">
                    <div>Load Factor: {(hashTable.loadFactor * 100).toFixed(1)}%</div>
                    <div>Table Size: {hashTable.size}</div>
                    <div>Total Entries: {hashTable.table.reduce((sum, chain) => sum + chain.length, 0)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-lg font-medium text-blue-600">{currentStep || 'Ready to perform operations'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Hash Table Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Hash Table</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {hashTable.table.map((chain, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-8 h-8 border-2 border-gray-300 rounded flex items-center justify-center text-sm font-bold">
                      {index}
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <div className="flex gap-1 min-h-[36px] items-center flex-wrap">
                      {chain.length === 0 ? (
                        <div className="px-3 py-1 bg-gray-100 rounded text-sm text-gray-500">
                          empty
                        </div>
                      ) : (
                        chain.map((entry, entryIndex) => entry && (
                          <div key={entryIndex} className="flex items-center gap-1">
                            <div
                              className={`px-3 py-1 rounded text-sm font-medium border-2 transition-colors ${
                                entry.isHighlighted
                                  ? 'bg-yellow-200 border-yellow-400 text-yellow-800'
                                  : entry.isCollision
                                  ? 'bg-red-100 border-red-400 text-red-800'
                                  : 'bg-blue-100 border-blue-400 text-blue-800'
                              }`}
                            >
                              {entry.key}: {entry.value}
                            </div>
                            {entryIndex < chain.length - 1 && collisionResolution === 'chaining' && (
                              <ArrowRight className="w-3 h-3 text-gray-400" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 border border-blue-400 rounded"></div>
                  <span className="text-sm">Normal Entry</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border border-red-400 rounded"></div>
                  <span className="text-sm">Collision</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-200 border border-yellow-400 rounded"></div>
                  <span className="text-sm">Currently Highlighted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                  <span className="text-sm">Empty Slot</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default HashTableVisualizer;
