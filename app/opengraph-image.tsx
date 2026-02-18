import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const runtime = 'nodejs';

export const alt = 'FOSS Club CEV - Open Source Community';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    // Load logo from public directory
    const logoData = await readFile(join(process.cwd(), 'public', 'logo.png'));
    const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;

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
                        inset: 0,
                        backgroundImage:
                            'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                        opacity: 0.3,
                    }}
                />

                {/* Glow Effect */}
                <div
                    style={{
                        position: 'absolute',
                        width: '600px',
                        height: '600px',
                        background: 'radial-gradient(circle, rgba(0, 230, 118, 0.15), transparent 70%)',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                />

                {/* Logo */}
                <img
                    src={logoBase64}
                    alt="FOSS CEV Logo"
                    width="300"
                    height="85"
                    style={{
                        objectFit: 'contain',
                        marginBottom: '40px',
                        zIndex: 10,
                    }}
                />

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
