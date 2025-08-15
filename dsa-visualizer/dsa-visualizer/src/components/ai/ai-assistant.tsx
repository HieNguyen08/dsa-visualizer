"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Send, 
  Code, 
  Play, 
  Copy, 
  Download,
  Settings,
  Languages,
  Sparkles,
  MessageSquare,
  Book,
  Lightbulb
} from 'lucide-react';

// Badge component
const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className || 'bg-gray-100 text-gray-800'}`}>
    {children}
  </span>
);

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  language?: string;
  code?: string;
}

interface CodeTemplate {
  language: string;
  name: string;
  template: string;
  description: string;
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const languages = [
    { id: 'javascript', name: 'JavaScript', ext: 'js' },
    { id: 'typescript', name: 'TypeScript', ext: 'ts' },
    { id: 'python', name: 'Python', ext: 'py' },
    { id: 'java', name: 'Java', ext: 'java' },
    { id: 'cpp', name: 'C++', ext: 'cpp' },
    { id: 'c', name: 'C', ext: 'c' },
    { id: 'csharp', name: 'C#', ext: 'cs' },
  ];

  const codeTemplates: CodeTemplate[] = [
    {
      language: 'javascript',
      name: 'Binary Search',
      description: 'Find target in sorted array',
      template: `function binarySearch(arr, target) {
    let left = 0, right = arr.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (arr[mid] === target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1;
}

// Test
const arr = [1, 3, 5, 7, 9, 11];
console.log(binarySearch(arr, 7)); // Output: 3`
    },
    {
      language: 'python',
      name: 'Quick Sort',
      description: 'Divide and conquer sorting algorithm',
      template: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quick_sort(left) + middle + quick_sort(right)

# Test
numbers = [64, 34, 25, 12, 22, 11, 90]
sorted_numbers = quick_sort(numbers)
print(f"Sorted array: {sorted_numbers}")`
    },
    {
      language: 'java',
      name: 'Dijkstra Algorithm',
      description: 'Shortest path algorithm',
      template: `import java.util.*;

public class Dijkstra {
    static class Edge {
        int to, weight;
        Edge(int to, int weight) {
            this.to = to;
            this.weight = weight;
        }
    }
    
    public static int[] dijkstra(List<Edge>[] graph, int start) {
        int n = graph.length;
        int[] dist = new int[n];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[start] = 0;
        
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]);
        pq.offer(new int[]{start, 0});
        
        while (!pq.isEmpty()) {
            int[] current = pq.poll();
            int u = current[0];
            int d = current[1];
            
            if (d > dist[u]) continue;
            
            for (Edge edge : graph[u]) {
                int v = edge.to;
                int weight = edge.weight;
                
                if (dist[u] + weight < dist[v]) {
                    dist[v] = dist[u] + weight;
                    pq.offer(new int[]{v, dist[v]});
                }
            }
        }
        
        return dist;
    }
}`
    },
    {
      language: 'cpp',
      name: 'Merge Sort',
      description: 'Stable divide and conquer sort',
      template: `#include <vector>
#include <iostream>

void merge(std::vector<int>& arr, int left, int mid, int right) {
    std::vector<int> temp(right - left + 1);
    int i = left, j = mid + 1, k = 0;
    
    while (i <= mid && j <= right) {
        if (arr[i] <= arr[j]) {
            temp[k++] = arr[i++];
        } else {
            temp[k++] = arr[j++];
        }
    }
    
    while (i <= mid) temp[k++] = arr[i++];
    while (j <= right) temp[k++] = arr[j++];
    
    for (int i = 0; i < temp.size(); i++) {
        arr[left + i] = temp[i];
    }
}

void mergeSort(std::vector<int>& arr, int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}

int main() {
    std::vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    mergeSort(arr, 0, arr.size() - 1);
    
    for (int num : arr) {
        std::cout << num << " ";
    }
    std::cout << std::endl;
    
    return 0;
}`
    }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        type: 'assistant',
        content: '👋 Hello! I\'m your AI Algorithm Assistant. I can help you with:\n\n• Algorithm explanations and implementations\n• Code review and optimization\n• Debugging and problem-solving\n• Data structure guidance\n• Multiple programming languages support\n\nWhat would you like to learn today?',
        timestamp: new Date()
      }]);
    }
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: String(Date.now()),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        {
          content: "Great question! Let me break this down for you step by step...",
          includeCode: true,
          language: selectedLanguage
        },
        {
          content: "Here's an efficient approach to solve this problem:",
          includeCode: true,
          language: selectedLanguage
        },
        {
          content: "I understand what you're looking for. This is a common algorithmic pattern...",
          includeCode: false
        }
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      let responseContent = randomResponse.content;
      let responseCode = '';

      if (randomResponse.includeCode) {
        const template = codeTemplates.find(t => t.language === selectedLanguage);
        if (template) {
          responseContent += `\n\nHere's an example implementation in ${languages.find(l => l.id === selectedLanguage)?.name}:`;
          responseCode = template.template;
        }
      }

      const assistantMessage: Message = {
        id: String(Date.now() + 1),
        type: 'assistant',
        content: responseContent,
        code: responseCode,
        language: randomResponse.includeCode ? selectedLanguage : undefined,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const loadTemplate = (template: CodeTemplate) => {
    setCode(template.template);
    setSelectedLanguage(template.language);
    setActiveTab('code');
  };

  const runCode = () => {
    // Mock code execution
    console.log('Running code:', code);
    // In a real implementation, you would send this to a code execution service
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <Card className="h-[800px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-600" />
            AI Algorithm Assistant
            <Badge className="bg-purple-100 text-purple-800">
              <Sparkles className="w-3 h-3 mr-1" />
              Advanced
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="code">Code Editor</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value="chat" className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-50 rounded-lg">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      {message.code && (
                        <div className="mt-3 p-3 bg-gray-900 text-green-400 rounded text-sm font-mono overflow-x-auto">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-400">
                              {languages.find(l => l.id === message.language)?.name}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(message.code!)}
                              className="text-gray-400 hover:text-white h-6"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <pre className="whitespace-pre-wrap">{message.code}</pre>
                        </div>
                      )}
                      <div className="text-xs opacity-70 mt-2">
                        {formatTimestamp(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border rounded-lg p-3 max-w-[70%]">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-gray-600">AI is typing...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-gray-400" />
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="px-2 py-1 border rounded text-sm"
                  >
                    {languages.map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Ask about algorithms, request code in ${languages.find(l => l.id === selectedLanguage)?.name}, or get help with debugging...`}
                    className="flex-1 min-h-[60px] resize-none"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="px-4"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Code Editor Tab */}
            <TabsContent value="code" className="flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  <span className="font-medium">Code Editor</span>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="ml-4 px-2 py-1 border rounded text-sm"
                  >
                    {languages.map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(code)}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button size="sm" onClick={runCode}>
                    <Play className="w-4 h-4 mr-1" />
                    Run
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400">
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={`Write your ${languages.find(l => l.id === selectedLanguage)?.name} code here...`}
                  className="w-full h-full bg-transparent border-none text-green-400 font-mono resize-none focus:outline-none"
                />
              </div>
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-full overflow-y-auto">
                {codeTemplates.map((template, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        {template.name}
                        <Badge className="ml-auto">
                          {languages.find(l => l.id === template.language)?.name}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-3">{template.description}</p>
                      <div className="bg-gray-100 p-3 rounded text-xs font-mono mb-3 max-h-32 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">
                          {template.template.substring(0, 200)}...
                        </pre>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => loadTemplate(template)}
                        className="w-full"
                      >
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    AI Assistant Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Default Programming Language</label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                    >
                      {languages.map((lang) => (
                        <option key={lang.id} value={lang.id}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Response Style</label>
                    <select className="w-full mt-1 px-3 py-2 border rounded-md">
                      <option>Detailed Explanations</option>
                      <option>Concise Answers</option>
                      <option>Beginner Friendly</option>
                      <option>Advanced Technical</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="includeComments" className="rounded" />
                    <label htmlFor="includeComments" className="text-sm">
                      Include detailed comments in code examples
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="showComplexity" className="rounded" defaultChecked />
                    <label htmlFor="showComplexity" className="text-sm">
                      Show time/space complexity analysis
                    </label>
                  </div>

                  <Button className="w-full">Save Settings</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Book className="w-5 h-5" />
                    Learning Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                      <Lightbulb className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Algorithm Patterns Guide</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                      <MessageSquare className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Common Interview Questions</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                      <Code className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">Code Templates Library</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssistant;
