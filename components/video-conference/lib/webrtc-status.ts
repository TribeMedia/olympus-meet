export interface WebRTCStats {
  connectionState: RTCPeerConnectionState;
  iceConnectionState: RTCIceConnectionState;
  iceGatheringState: RTCIceGatheringState;
  signalingState: RTCSignalingState;
  localCandidates: RTCIceCandidate[];
  remoteCandidates: RTCIceCandidate[];
  selectedCandidate?: {
    local: RTCIceCandidate;
    remote: RTCIceCandidate;
  };
}

export interface WebRTCMetrics {
  bitrate: number;
  packetsLost: number;
  roundTripTime: number;
  jitter: number;
}

export class WebRTCStatus {
  private pc: RTCPeerConnection;

  constructor(peerConnection: RTCPeerConnection) {
    this.pc = peerConnection;
  }

  async getStats(): Promise<WebRTCStats> {
    const stats: WebRTCStats = {
      connectionState: this.pc.connectionState,
      iceConnectionState: this.pc.iceConnectionState,
      iceGatheringState: this.pc.iceGatheringState,
      signalingState: this.pc.signalingState,
      localCandidates: [],
      remoteCandidates: [],
    };

    return stats;
  }

  async getMetrics(): Promise<WebRTCMetrics> {
    const metrics: WebRTCMetrics = {
      bitrate: 0,
      packetsLost: 0,
      roundTripTime: 0,
      jitter: 0,
    };

    try {
      const stats = await this.pc.getStats();
      stats.forEach((report) => {
        if (report.type === 'inbound-rtp' && report.kind === 'video') {
          metrics.packetsLost = report.packetsLost || 0;
          metrics.jitter = report.jitter ? report.jitter * 1000 : 0;
        }
      });
    } catch (error) {
      console.error('Error getting WebRTC metrics:', error);
    }

    return metrics;
  }

  isConnected(): boolean {
    return this.pc.connectionState === 'connected';
  }

  getConnectionQuality(): 'excellent' | 'good' | 'poor' | 'disconnected' {
    switch (this.pc.connectionState) {
      case 'connected':
        return 'excellent';
      case 'connecting':
        return 'good';
      case 'disconnected':
      case 'failed':
        return 'poor';
      default:
        return 'disconnected';
    }
  }
}
