<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>LocalPDF - Sitemap</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            background-color: #f8fafc;
            margin: 0;
            padding: 20px;
          }
          
          .header {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          
          .header h1 {
            color: #1a202c;
            margin: 0 0 10px 0;
            font-size: 24px;
          }
          
          .header p {
            color: #64748b;
            margin: 0;
          }
          
          .stats {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px 20px;
            margin-bottom: 20px;
            display: flex;
            gap: 30px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          
          .stat {
            text-align: center;
          }
          
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #3b82f6;
          }
          
          .stat-label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
          }
          
          .url-list {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          
          .url-item {
            border-bottom: 1px solid #f1f5f9;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .url-item:last-child {
            border-bottom: none;
          }
          
          .url-item:hover {
            background-color: #f8fafc;
          }
          
          .url-link {
            color: #3b82f6;
            text-decoration: none;
            font-weight: 500;
          }
          
          .url-link:hover {
            text-decoration: underline;
          }
          
          .url-meta {
            display: flex;
            gap: 15px;
            font-size: 12px;
            color: #64748b;
          }
          
          .priority {
            background: #dbeafe;
            color: #1e40af;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 500;
          }
          
          .high-priority { background: #dcfce7; color: #166534; }
          .medium-priority { background: #fef3c7; color: #92400e; }
          
          .lang-badges {
            display: flex;
            gap: 4px;
            margin-top: 5px;
          }
          
          .lang-badge {
            background: #f1f5f9;
            color: #475569;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: 500;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>LocalPDF Sitemap</h1>
          <p>This sitemap contains all pages with multilingual support and proper hreflang attributes for SEO.</p>
        </div>
        
        <div class="stats">
          <div class="stat">
            <div class="stat-value"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></div>
            <div class="stat-label">Total URLs</div>
          </div>
          <div class="stat">
            <div class="stat-value">5</div>
            <div class="stat-label">Languages</div>
          </div>
          <div class="stat">
            <div class="stat-value"><xsl:value-of select="count(sitemap:urlset/sitemap:url//xhtml:link)"/></div>
            <div class="stat-label">Hreflang Links</div>
          </div>
        </div>
        
        <div class="url-list">
          <xsl:for-each select="sitemap:urlset/sitemap:url">
            <div class="url-item">
              <div>
                <a href="{sitemap:loc}" class="url-link">
                  <xsl:value-of select="sitemap:loc"/>
                </a>
                <div class="lang-badges">
                  <xsl:for-each select=".//xhtml:link[@rel='alternate'][@hreflang!='x-default']">
                    <span class="lang-badge">
                      <xsl:value-of select="@hreflang"/>
                    </span>
                  </xsl:for-each>
                </div>
              </div>
              <div class="url-meta">
                <span>
                  <xsl:attribute name="class">
                    priority 
                    <xsl:choose>
                      <xsl:when test="sitemap:priority = '1.0'">high-priority</xsl:when>
                      <xsl:when test="sitemap:priority = '0.9'">medium-priority</xsl:when>
                      <xsl:otherwise></xsl:otherwise>
                    </xsl:choose>
                  </xsl:attribute>
                  Priority: <xsl:value-of select="sitemap:priority"/>
                </span>
                <span><xsl:value-of select="sitemap:changefreq"/></span>
                <span><xsl:value-of select="sitemap:lastmod"/></span>
              </div>
            </div>
          </xsl:for-each>
        </div>
        
      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>