import { ImageResponse } from 'next/og';

export const alt = 'FOSS Club CEV - Open Source Community';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    // Use a cool dark theme to match the site
    return new ImageResponse(
        (
            <div
                style={{
                    background: '#0a0a0a',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                    position: 'relative',
                }}
            >
                {/* Minimal Grid Background */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage:
                            'linear-gradient(rgba(0, 230, 118, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 230, 118, 0.1) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                        opacity: 0.5,
                    }}
                />

                {/* Cyberpunk Accent Top Band */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: '#00E676',
                    }}
                />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px', zIndex: 10 }}>
                    {/* Simplified Terminal/Hacker Icon */}
                    <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#00E676" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="4 17 10 11 4 5"></polyline>
                        <line x1="12" y1="19" x2="20" y2="19"></line>
                    </svg>
                </div>

                <div
                    style={{
                        fontSize: '80px',
                        fontWeight: 900,
                        color: 'white',
                        letterSpacing: '-2px',
                        marginBottom: '10px',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                    }}
                >
                    <span style={{ color: '#00E676' }}>FOSS</span>
                    <span>CLUB</span>
                </div>

                <div
                    style={{
                        fontSize: '36px',
                        color: '#cccccc',
                        fontWeight: 600,
                        letterSpacing: '4px',
                        textTransform: 'uppercase',
                        marginBottom: '40px',
                        zIndex: 10,
                    }}
                >
                    CE Vadakara
                </div>

                {/* Subtitle / Tagline */}
                <div
                    style={{
                        fontSize: '30px',
                        color: '#888888',
                        marginTop: '10px',
                        zIndex: 10,
                        display: 'flex',
                        gap: '15px'
                    }}
                >
                    <span>CODE</span>
                    <span style={{ color: '#00E676' }}>/</span>
                    <span>COLLABORATE</span>
                    <span style={{ color: '#00E676' }}>/</span>
                    <span>CREATE</span>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
