// src/components/PlantCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface PlantCardProps {
  name: string;
  confidence: number;
  description?: string;
  tips?: string[];
  image_url?: string;
}

export function PlantCard({
  name,
  confidence,
  description,
  tips,
  image_url,
}: PlantCardProps) {
  console.log("PlantCard image_url:", image_url);
  console.log("Is data URL:", image_url?.startsWith("data:image/"));

  return (
    <Card className="overflow-hidden">
      {image_url && (
        <Image
          src={image_url}
          alt={name}
          className="w-full h-48 object-cover"
          width={400}
          height={192}
          onError={(e) => console.error("Image load error:", e)}
        />
      )}
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {name}
          <Badge variant={confidence > 0.8 ? "default" : "secondary"}>
            {(confidence * 100).toFixed(0)}% confidence
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {tips && tips.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Care Tips</h4>
            <ul className="list-disc pl-5 space-y-1">
              {tips.map((tip, index) => (
                <li key={index} className="text-sm">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
