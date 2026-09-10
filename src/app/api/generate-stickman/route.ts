import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const { topic, mode, scene_number, existing_prompt, prompt_type, base_prompt, scene_context } = requestBody;

    let prompt = "";

    if (mode === "single_prompt") {
       prompt = `
You are an expert AI YouTube content creator and visual storytelling expert specializing in simple stickman animations.
Regenerate ONLY the ${prompt_type === 'image' ? 'Image Prompt' : 'Animation Prompt'} for Scene ${scene_number}.

Topic: "${topic}"
Context: "${scene_context}"
${prompt_type === 'image' ? `Stickman Base Prompt: "${base_prompt}"` : ''}
Previous Prompt (DO NOT REPEAT): "${existing_prompt}"

RULES:
- Make it different from the previous prompt.
- Keep it aligned with the context of the scene.
- Keep descriptions clear, simple, and visual.
${prompt_type === 'image' ? '- Must start with "Use the same stickman character as before."\n- Include Pose, Action, Facial Expression, at least one Prop, and clean/simple background.\n- Aspect ratio MUST be 16:9.' : '- Keep movements slow, natural, and minimal.\n- Only animate arms, head, facial expression, or props. Body position remains mostly static.'}

Reply ONLY with a valid JSON:
{
  "${prompt_type === 'image' ? 'image_prompt' : 'animation_prompt'}": "The new prompt in English..."
}
`;
    } else {
      prompt = `
1. ROLE
You are a professional AI YouTube content creator and visual storytelling expert specializing in simple stickman animations.

TASK
Create a complete ~59-second YouTube video on the topic:
"${topic || 'Generate a short, engaging topic for a motivational or psychology-based video that inspires personal growth.'}"

The video should be engaging, beginner-friendly, and easy to understand.
Total duration: 55–60 seconds
Divide the video into 10 scenes (approximately 6 seconds each).

OUTPUT FORMAT:

PART 1: Image Prompts (Paragraph Style)
Step 1 – Character Base Prompt
Before writing the scene prompts, first create a Stickman Base Design Prompt that matches the mood and theme of the story.
This base prompt should include:
- Overall vibe: Cheerful, modern, and engaging.
- Character style: Modern 2D vector animation style, cute stylized stickman wearing a trendy hoodie and sneakers, perfectly round head with casual messy hair, thick black outlines, flat solid colors, expressive and happy face.
- MUST include keywords: "High quality vector art, crisp thick outlines, white background, trendy youth clothing, cheerful anime-like eyes".

Step 2 – Scene Image Prompts
For each scene, write one paragraph.
Start every paragraph with: "Use the same stickman character as before."
Then describe clearly:
- Pose (standing, sitting, walking, etc.)
- Action
- Facial expression
- At least one prop (required in every scene — examples: table, chair, clock, phone, book, laptop, etc.)
- Clean, simple background (plain white or minimal)
Guidelines: Aspect ratio MUST be 16:9. Keep the character design identical across all scenes.

PART 2: Motion / Animation Prompts
For each scene, provide short animation instructions.
Rules: Only animate arms, head, facial expression, or props. Body position remains mostly static. Movements should be slow, natural, and minimal. Mention emotion if relevant.

PART 3: Voiceover Script
For each scene: Write short, engaging narration in SPANISH (Español) (1–2 sentences per scene). Clearly describe what the stickman is doing, thinking, or feeling, and the purpose of the scene. Include tone or emotion.

GLOBAL RULES
- Same stickman character throughout the entire video
- Only pose, expression, or props change
- Output must fit a ~59-second video
- CRITICAL: The 'title' and 'voiceover' MUST be written in fluent SPANISH.
- CRITICAL: The 'base_prompt', 'image_prompt', and 'animation_prompt' MUST be written in ENGLISH.

Respond ONLY with a valid JSON object matching this structure:
{
  "title": "Título del video en español",
  "base_prompt": "The Stickman Base Design Prompt in English...",
  "scenes": [
    {
      "scene_number": 1,
      "voiceover": "Narración en español...",
      "image_prompt": "Image prompt in English...",
      "animation_prompt": "Animation prompt in English..."
    }
  ]
}
`;
    }

    const jsonText = await chatCompletion(requestBody, prompt, { temperature: 0.7 });
    const data = JSON.parse(jsonText);

    return NextResponse.json(data);
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating stickman video:", errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
