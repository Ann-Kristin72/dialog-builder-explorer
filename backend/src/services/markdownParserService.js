import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

class MarkdownParserService {
  // Parse Markdown content into structured format
  static parseMarkdown(content) {
    const lines = content.split('\n');
    const result = {
      title: null,
      frontmatter: null,
      nanos: []
    };

    let currentNano = null;
    let currentUnit = null;
    let currentContent = [];
    let currentAssets = [];
    let inFrontmatter = false;
    let frontmatterContent = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for frontmatter in //[] comments
      if (line.startsWith('[//]: # (')) {
        inFrontmatter = true;
        frontmatterContent.push(line);
        continue;
      }
      
      if (inFrontmatter) {
        if (line.includes(')')) {
          frontmatterContent.push(line);
          inFrontmatter = false;
          try {
            const frontmatterText = frontmatterContent.join('\n')
              .replace('[//]: # (', '')
              .replace(')', '');
            result.frontmatter = JSON.parse(frontmatterText);
          } catch (error) {
            console.warn('Could not parse frontmatter:', error.message);
          }
          continue;
        } else {
          frontmatterContent.push(line);
          continue;
        }
      }

      // Check for main title (#)
      if (line.startsWith('# ') && !line.startsWith('##') && !line.startsWith('###')) {
        result.title = line.substring(2).trim();
        continue;
      }

      // Check for Nano (##)
      if (line.startsWith('## ')) {
        // Save previous unit if exists
        if (currentUnit) {
          currentNano.units.push({
            slug: currentUnit.slug,
            title: currentUnit.title,
            content: currentContent.join('\n'),
            content_plain: this.extractPlainText(currentContent.join('\n')),
            assets: currentAssets
          });
        }
        
        // Save previous nano if exists
        if (currentNano) {
          result.nanos.push(currentNano);
        }

        // Start new nano
        const nanoTitle = line.substring(3).trim();
        const nanoSlug = this.generateSlug(nanoTitle);
        currentNano = {
          slug: nanoSlug,
          title: nanoTitle,
          units: []
        };
        currentUnit = null;
        currentContent = [];
        currentAssets = [];
        continue;
      }

      // Check for Unit (###)
      if (line.startsWith('### ')) {
        // Save previous unit if exists
        if (currentUnit) {
          currentNano.units.push({
            slug: currentUnit.slug,
            title: currentUnit.title,
            content: currentContent.join('\n'),
            content_plain: this.extractPlainText(currentContent.join('\n')),
            assets: currentAssets
          });
        }

        // Start new unit
        const unitTitle = line.substring(4).trim();
        const unitSlug = this.generateSlug(unitTitle);
        currentUnit = {
          slug: unitSlug,
          title: unitTitle
        };
        currentContent = [];
        currentAssets = [];
        continue;
      }

      // Check for assets (URLs on their own line)
      if (this.isAssetUrl(line)) {
        currentAssets.push({
          url: line.trim(),
          kind: this.detectAssetKind(line),
          alt: null
        });
        continue;
      }

      // Check for inline images ![alt](url)
      const inlineImageMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (inlineImageMatch) {
        currentAssets.push({
          url: inlineImageMatch[2],
          kind: 'image',
          alt: inlineImageMatch[1] || null
        });
        // Keep the markdown in content
        currentContent.push(line);
        continue;
      }

      // Regular content line
      if (line) {
        currentContent.push(line);
      }
    }

    // Save final unit and nano
    if (currentUnit) {
      currentNano.units.push({
        slug: currentUnit.slug,
        title: currentUnit.title,
        content: currentContent.join('\n'),
        content_plain: this.extractPlainText(currentContent.join('\n')),
        assets: currentAssets
      });
    }
    
    if (currentNano) {
      result.nanos.push(currentNano);
    }

    return result;
  }

  // Extract plain text from markdown for embeddings
  static extractPlainText(markdown) {
    return markdown
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1') // Replace images with alt text
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1') // Replace links with text
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/`([^`]+)`/g, '$1') // Remove code
      .replace(/>\s*(.+)/g, '$1') // Remove blockquote markers
      .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
      .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
      .trim();
  }

  // Generate slug from title
  static generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // Check if line is an asset URL
  static isAssetUrl(line) {
    const trimmed = line.trim();
    return (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('//')
    ) && !trimmed.includes(' ');
  }

  // Detect asset kind from URL
  static detectAssetKind(url) {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('.mp3') || lowerUrl.includes('.wav') || lowerUrl.includes('.ogg')) {
      return 'audio';
    }
    if (lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg') || lowerUrl.includes('.png') || 
        lowerUrl.includes('.gif') || lowerUrl.includes('.webp') || lowerUrl.includes('.svg')) {
      return 'image';
    }
    return 'other';
  }

  // Split content into chunks for embedding
  static async splitContent(content, maxTokens = 1500) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: maxTokens,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '. ', ' ', '']
    });

    const chunks = await splitter.splitText(content);
    return chunks;
  }
}

export default MarkdownParserService;
