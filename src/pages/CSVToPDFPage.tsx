                  {/* REVOLUTIONARY TABLE SYSTEM - NO OVERLAP GUARANTEED */}
                  <div className="csv-table-container">
                    <div className="csv-table-wrapper">
                      <table className="csv-table">
                        <thead>
                          <tr>
                            {parseResult.headers.map((header, index) => (
                              <th key={index} title={header}>
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {parseResult.data.slice(0, 5).map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {parseResult.headers.map((header, colIndex) => (
                                <td key={colIndex} title={String(row[header] || '')}>
                                  {String(row[header] || '')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>