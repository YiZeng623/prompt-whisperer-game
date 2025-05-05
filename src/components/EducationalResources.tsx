
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { promptEngineeringTips } from "@/lib/game-data";

export const EducationalResources = () => {
  return (
    <Card className="border-muted">
      <CardHeader>
        <CardTitle>Prompt Engineering Resources</CardTitle>
        <CardDescription>
          Learn more about prompt engineering techniques and AI safety
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tips">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="tips">Tips & Tricks</TabsTrigger>
            <TabsTrigger value="techniques">Techniques</TabsTrigger>
            <TabsTrigger value="safety">AI Safety</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tips" className="space-y-4">
            <h3 className="font-medium text-lg">Prompt Engineering Tips</h3>
            <ul className="space-y-2 list-disc pl-5">
              {promptEngineeringTips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </TabsContent>
          
          <TabsContent value="techniques" className="space-y-4">
            <h3 className="font-medium text-lg">Advanced Techniques</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Context Switching</h4>
                <p className="text-muted-foreground">Asking the AI to switch roles or imagine different scenarios can bypass certain restrictions.</p>
              </div>
              
              <div>
                <h4 className="font-medium">Prefix Injection</h4>
                <p className="text-muted-foreground">Inserting system-like commands at the beginning of prompts to modify AI behavior.</p>
              </div>
              
              <div>
                <h4 className="font-medium">Hypothetical Scenarios</h4>
                <p className="text-muted-foreground">Framing requests as hypothetical situations to encourage the AI to explore restricted topics.</p>
              </div>
              
              <div>
                <h4 className="font-medium">Token Manipulation</h4>
                <p className="text-muted-foreground">Breaking words or using alternative spellings to bypass content filters.</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="safety" className="space-y-4">
            <h3 className="font-medium text-lg">AI Safety Considerations</h3>
            
            <div className="space-y-4">
              <p>
                Understanding prompt vulnerabilities is crucial for developing safer AI systems. 
                This educational platform demonstrates common weaknesses and how they can be addressed.
              </p>
              
              <div>
                <h4 className="font-medium">Common Vulnerabilities</h4>
                <ul className="list-disc pl-5">
                  <li>Direct instruction following without context awareness</li>
                  <li>Context switching confusion</li>
                  <li>Inconsistent rule application</li>
                  <li>Lack of memory of previous safety instructions</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium">Building Better Guardrails</h4>
                <p className="text-muted-foreground">
                  Modern LLM systems employ multiple layers of safety mechanisms, including:
                </p>
                <ul className="list-disc pl-5">
                  <li>Pre-training safety alignment</li>
                  <li>Content filtering</li>
                  <li>RLHF (Reinforcement Learning from Human Feedback)</li>
                  <li>Multi-step reasoning before responding</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
