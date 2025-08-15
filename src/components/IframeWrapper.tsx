import React, { ReactNode, useEffect, useState } from 'react';

interface IframeWrapperProps {
  children: ReactNode;
}

export const IframeWrapper: React.FC<IframeWrapperProps> = ({ children }) => {
  const [isInIframe, setIsInIframe] = useState(false);
  const [iframeHeight, setIframeHeight] = useState<number | null>(null);

  useEffect(() => {
    // Sjekk om vi kjører i iframe
    const checkIframe = () => {
      const inIframe = window.self !== window.top;
      setIsInIframe(inIframe);

      if (inIframe) {
        // Hvis i iframe, tilpass høyde
        const parentHeight = window.parent.innerHeight || 700;
        setIframeHeight(Math.max(600, parentHeight - 100)); // 100px buffer

        // Send høyde til parent (hvis det er Teams/SharePoint)
        try {
          window.parent.postMessage(
            { type: 'TEKNOTASSEN_HEIGHT', height: iframeHeight },
            '*'
          );
        } catch (error) {
          console.log('Could not send height to parent');
        }
      }
    };

    checkIframe();

    // Lyt på resize events
    const handleResize = () => {
      if (isInIframe) {
        checkIframe();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isInIframe, iframeHeight]);

  // Hvis i iframe, tilpass styling
  if (isInIframe) {
    return (
      <div 
        className="iframe-mode"
        style={{
          minHeight: iframeHeight ? `${iframeHeight}px` : '600px',
          padding: '16px',
          backgroundColor: '#f8fafc',
        }}
      >
        <div className="iframe-header mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">T</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-blue-900">
                TeknoTassen
              </h1>
              <p className="text-sm text-blue-700">
                Velferdsteknologi AI-Assistent
              </p>
            </div>
          </div>
        </div>
        
        <div className="iframe-content">
          {children}
        </div>
      </div>
    );
  }

  // Normal visning
  return <>{children}</>;
};

export default IframeWrapper;
