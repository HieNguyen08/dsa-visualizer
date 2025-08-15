"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Clock, Zap, BookOpen } from 'lucide-react';

interface AlgorithmPrincipleProps {
  title: string;
  description: string;
  timeComplexity: {
    best?: string;
    average?: string;
    worst?: string;
  };
  spaceComplexity: string;
  principles: string[];
  applications: string[];
  advantages: string[];
  disadvantages?: string[];
  keySteps?: string[];
}

export const AlgorithmPrinciple: React.FC<AlgorithmPrincipleProps> = ({
  title,
  description,
  timeComplexity,
  spaceComplexity,
  principles,
  applications,
  advantages,
  disadvantages = [],
  keySteps = []
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Info className="w-4 h-4" />
          Nguyên lý thuật toán
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            {title}
          </DialogTitle>
          <DialogDescription className="text-lg">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 mt-6">
          {/* Time & Space Complexity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Độ phức tạp thời gian
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {timeComplexity.best && (
                    <div className="flex justify-between">
                      <span>Tốt nhất:</span>
                      <Badge variant="secondary">{timeComplexity.best}</Badge>
                    </div>
                  )}
                  {timeComplexity.average && (
                    <div className="flex justify-between">
                      <span>Trung bình:</span>
                      <Badge variant="secondary">{timeComplexity.average}</Badge>
                    </div>
                  )}
                  {timeComplexity.worst && (
                    <div className="flex justify-between">
                      <span>Tệ nhất:</span>
                      <Badge variant="destructive">{timeComplexity.worst}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-green-600" />
                  Độ phức tạp không gian
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {spaceComplexity}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Principles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                Nguyên lý chính
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {principles.map((principle, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <span>{principle}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Key Steps */}
          {keySteps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Các bước chính</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {keySteps.map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* Applications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ứng dụng thực tế</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {applications.map((app, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    <span className="text-sm">{app}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Advantages & Disadvantages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-700">Ưu điểm</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {advantages.map((advantage, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500 font-bold">+</span>
                      <span>{advantage}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {disadvantages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-red-700">Nhược điểm</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {disadvantages.map((disadvantage, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-red-500 font-bold">-</span>
                        <span>{disadvantage}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
