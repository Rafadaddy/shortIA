'use server'

import path from 'path';

export async function startCompileVideo(id: string, subject: string, scriptText: string, voiceName: string = '', subColor: string = '#FFFFFF', music: string = 'random', images: string[] = []) {
  try {
    let video_source = 'pexels';
    let video_materials: any[] = [];

    if (images && images.length > 0) {
      video_source = 'local';
      // MPT expects absolute local paths for 'local' provider
      video_materials = images.map(img => ({
        provider: 'local',
        url: path.join(process.cwd(), 'public', img)
      }));
    }

    const payload = {
      video_subject: subject,
      video_script: scriptText,
      video_source: video_source,
      video_materials: video_materials.length > 0 ? video_materials : undefined,
      video_aspect: '9:16',
      video_concat_mode: 'random',
      video_clip_duration: 5,
      video_count: 1,
      subtitle_enabled: true,
      font_name: 'STHeitiMedium.ttc',
      font_size: 60,
      text_fore_color: subColor || '#FFFFFF',
      stroke_color: '#000000',
      stroke_width: 1.5,
      bgm_type: music === 'none' ? '' : 'random',
      bgm_volume: music === 'none' ? 0 : 0.2,
      voice_name: voiceName || '',
      voice_volume: 1.0,
      voice_rate: 1.0,
      n_threads: 2,
    };

    console.log("Starting MPT Task:", payload);

    const response = await fetch('http://127.0.0.1:8080/api/v1/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`MPT API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.task_id; // returns task_id
  } catch (err) {
    console.error('Error starting video compile:', err);
    throw err;
  }
}

export async function checkCompileStatus(taskId: string) {
  try {
    const response = await fetch(`http://127.0.0.1:8080/api/v1/tasks/${taskId}`);
    if (!response.ok) {
      throw new Error(`MPT API Error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data; 
    // Returns { state: 1, progress: 100, videos: ["/tasks/example/final-1.mp4"] } 
    // State: 1 = complete, -1 = error, 0 = running
  } catch (err) {
    console.error('Error checking video status:', err);
    throw err;
  }
}
