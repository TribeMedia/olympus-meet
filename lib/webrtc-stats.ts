interface WebRTCStats {
  bitrate?: number;
  packetLoss?: number;
  roundTripTime?: number;
  jitter?: number;
  frameRate?: number;
  resolution?: {
    width: number;
    height: number;
  };
}

export async function getWebRTCStats(stream: MediaStream): Promise<WebRTCStats> {
  return new Promise((resolve) => {
    // Create a peer connection to measure stats
    const pc = new RTCPeerConnection();
    const stats: WebRTCStats = {};

    // Add tracks to the peer connection
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    // Create a data channel to establish connection
    pc.createDataChannel('stats');

    // Create offer and set local description
    pc.createOffer().then(offer => {
      pc.setLocalDescription(offer);

      // Wait for ICE gathering to complete
      setTimeout(async () => {
        try {
          const reports = await pc.getStats();
          
          reports.forEach(report => {
            if (report.type === 'outbound-rtp') {
              if (report.kind === 'video') {
                stats.frameRate = report.framesPerSecond;
                stats.resolution = {
                  width: report.frameWidth,
                  height: report.frameHeight
                };
              }
              stats.bitrate = report.bytesSent * 8 / (report.timestamp - report.startTime);
              stats.packetLoss = report.packetsLost ? report.packetsLost / report.packetsSent : 0;
            } else if (report.type === 'candidate-pair' && report.state === 'succeeded') {
              stats.roundTripTime = report.currentRoundTripTime;
            }
          });

          resolve(stats);
        } catch (err) {
          console.error('Failed to get WebRTC stats:', err);
          resolve({});
        } finally {
          // Clean up
          pc.close();
        }
      }, 1000); // Give time for ICE gathering
    }).catch(err => {
      console.error('Failed to create offer:', err);
      pc.close();
      resolve({});
    });
  });
}

export function startEchoTest(stream: MediaStream): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      const audioContext = new AudioContextClass();
      const source = audioContext.createMediaStreamSource(stream);
      const delay = audioContext.createDelay(0.5); // 500ms delay
      const gain = audioContext.createGain();

      // Set up echo test
      source.connect(delay);
      delay.connect(gain);
      gain.connect(audioContext.destination);

      // Reduce volume to prevent feedback
      gain.gain.value = 0.5;

      // Run echo test for 3 seconds
      setTimeout(() => {
        gain.disconnect();
        delay.disconnect();
        source.disconnect();
        audioContext.close();
        resolve();
      }, 3000);
    } catch (err) {
      reject(err);
    }
  });
}

export function getAudioLevel(stream: MediaStream): number {
  const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
  const audioContext = new AudioContextClass();
  const analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);

  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  analyser.getByteFrequencyData(dataArray);
  const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
  
  // Clean up
  source.disconnect();
  audioContext.close();

  return average / 128; // Normalize to 0-1
}
