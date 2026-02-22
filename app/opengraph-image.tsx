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
                    background: 'linear-gradient(to bottom right, #000000, #111111)',
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
                {/* Abstract Background Grid */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage:
                            'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                        opacity: 0.3,
                    }}
                />

                {/* Glow Effect */}
                {/* Glow Effect Removed - radial-gradient is not supported in Satori */}

                {/* SVG Logo Replacement */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px', zIndex: 10 }}>
                    <svg width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="#00E676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                </div>

                {/* Text */}
                <div
                    style={{
                        fontSize: '60px',
                        fontWeight: 800,
                        color: 'white',
                        letterSpacing: '-2px',
                        marginBottom: '20px',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                    }}
                >
                    <span>BUILD</span>
                    <span style={{ color: '#00E676' }}>•</span>
                    <span>SHIP</span>
                    <span style={{ color: '#00E676' }}>•</span>
                    <span>INNOVATE</span>
                </div>

                {/* Subtitle */}
                <div
                    style={{
                        fontSize: '30px',
                        color: '#888888',
                        marginTop: '20px',
                        zIndex: 10,
                    }}
                >
                    foss-cev.org
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
