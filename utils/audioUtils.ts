
// Base64 to Uint8Array
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Raw PCM to AudioBuffer
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


// The following functions are used to convert an AudioBuffer to a WAV blob URL
// that can be used in an <audio> tag.

const setUint16 = (data: DataView, offset: number, value: number) => {
    data.setUint16(offset, value, true);
};

const setUint32 = (data: DataView, offset: number, value: number) => {
    data.setUint32(offset, value, true);
};

const writeWavHeader = (
    data: DataView,
    sampleRate: number,
    numFrames: number,
    numChannels: number
) => {
    // RIFF identifier
    data.setUint8(0, 'R'.charCodeAt(0));
    data.setUint8(1, 'I'.charCodeAt(0));
    data.setUint8(2, 'F'.charCodeAt(0));
    data.setUint8(3, 'F'.charCodeAt(0));
    // RIFF chunk length
    setUint32(data, 4, 36 + numFrames * numChannels * 2);
    // RIFF type
    data.setUint8(8, 'W'.charCodeAt(0));
    data.setUint8(9, 'A'.charCodeAt(0));
    data.setUint8(10, 'V'.charCodeAt(0));
    data.setUint8(11, 'E'.charCodeAt(0));
    // format chunk identifier
    data.setUint8(12, 'f'.charCodeAt(0));
    data.setUint8(13, 'm'.charCodeAt(0));
    data.setUint8(14, 't'.charCodeAt(0));
    data.setUint8(15, ' '.charCodeAt(0));
    // format chunk length
    setUint32(data, 16, 16);
    // sample format (raw)
    setUint16(data, 20, 1);
    // channel count
    setUint16(data, 22, numChannels);
    // sample rate
    setUint32(data, 24, sampleRate);
    // byte rate (sample rate * block align)
    setUint32(data, 28, sampleRate * numChannels * 2);
    // block align (channel count * bytes per sample)
    setUint16(data, 32, numChannels * 2);
    // bits per sample
    setUint16(data, 34, 16);
    // data chunk identifier
    data.setUint8(36, 'd'.charCodeAt(0));
    data.setUint8(37, 'a'.charCodeAt(0));
    data.setUint8(38, 't'.charCodeAt(0));
    data.setUint8(39, 'a'.charCodeAt(0));
    // data chunk length
    setUint32(data, 40, numFrames * numChannels * 2);
};

export const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numChannels = buffer.numberOfChannels;
    const numFrames = buffer.length;
    const sampleRate = buffer.sampleRate;
    const wavHeaderLength = 44;

    const wavBuffer = new ArrayBuffer(wavHeaderLength + numFrames * numChannels * 2);
    const view = new DataView(wavBuffer);
    
    writeWavHeader(view, sampleRate, numFrames, numChannels);

    const channels = [];
    for (let i = 0; i < numChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }

    let offset = wavHeaderLength;
    for (let i = 0; i < numFrames; i++) {
        for (let j = 0; j < numChannels; j++) {
            const sample = Math.max(-1, Math.min(1, channels[j][i]));
            const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(offset, intSample, true);
            offset += 2;
        }
    }

    return new Blob([view], { type: 'audio/wav' });
};
