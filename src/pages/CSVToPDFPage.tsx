                  {/* COMPLETELY REBUILT Table Preview */}
                  <div className="csv-table-container">
                    <div className="csv-table-wrapper">
                      <table className="csv-table">
                        <thead>
                          <tr>
                            {parseResult.headers.map((header, index) => (
                              <th key={index}>
                                <div className="csv-cell-content" title={header}>
                                  {header}
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {parseResult.data.slice(0, 5).map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {parseResult.headers.map((header, colIndex) => (
                                <td key={colIndex}>
                                  <div className="csv-cell-content" title={String(row[header] || '')}>
                                    {String(row[header] || '')}
                                  </div>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>