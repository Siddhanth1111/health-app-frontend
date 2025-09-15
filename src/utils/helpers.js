export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatLastSeen = (lastSeen) => {
  const date = new Date(lastSeen);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
  return date.toLocaleDateString();
};

export const generateAvatarUrl = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff&size=150`;
};

export const debugMediaStream = (stream, label) => {
  if (stream) {
    console.log(`${label} stream:`, stream);
    console.log(`${label} tracks:`, stream.getTracks());
    stream.getTracks().forEach((track, index) => {
      console.log(`${label} track ${index}:`, {
        kind: track.kind,
        enabled: track.enabled,
        readyState: track.readyState,
        muted: track.muted
      });
    });
  }
};
