import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import React from "react";
import { ImageOutput, useShinyInput, useShinyOutput } from "shiny-react";

interface TableData {
  [key: string]: any[];
}

export function SimpleApp() {
  const [inputText, setInputText] = useShinyInput<string>("user_text", "");
  const [buttonTrigger, setButtonTrigger] = useShinyInput<{}>(
    "button_trigger",
    {},
    { priority: "event" }
  );

  const [processedText] = useShinyOutput<string>("processed_text", "");
  const [textLength] = useShinyOutput<number>("text_length", 0);
  const [buttonResponse] = useShinyOutput<string>("button_response", "");

  const [tableData] = useShinyOutput<TableData>("table_data", undefined);

  const handleClick = () => {
    setButtonTrigger({});
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  };

  // Get column names and row count from table data
  const columnNames = tableData ? Object.keys(tableData) : [];
  const numRows =
    columnNames.length > 0 && tableData ? tableData[columnNames[0]].length : 0;

  return (
    <div className='min-h-screen bg-background p-6'>
      <div className='max-w-4xl mx-auto space-y-6'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold tracking-tight'>
            Shiny + React + shadcn/ui
          </h1>
          <p className='text-muted-foreground mt-2'>
            Demonstrating shadcn/ui components with various shiny-react output
            types
          </p>
        </div>

        <Separator />

        <div className='grid gap-6 md:grid-cols-2'>
          {/* Text Input Card */}
          <Card>
            <CardHeader>
              <CardTitle>Text Input</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <label
                  htmlFor='text-input'
                  className='text-sm font-medium mb-2 block'
                >
                  Enter some text:
                </label>
                <Input
                  id='text-input'
                  type='text'
                  placeholder='Type something...'
                  value={inputText}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <p className='text-sm text-muted-foreground mb-2'>
                  Processed text from server:
                </p>
                <div className='bg-muted p-3 rounded-md'>
                  <pre className='text-sm'>
                    {processedText || "No text entered yet"}
                  </pre>
                </div>
              </div>
              <div className='text-sm'>
                <Badge variant='secondary'>Length: {textLength}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Button Event Card */}
          <Card>
            <CardHeader>
              <CardTitle>Button Events</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground mb-2'>
                  Click to trigger server event:
                </p>
                <Button
                  onClick={handleClick}
                  variant='default'
                  className='w-full'
                >
                  Send Event
                </Button>
              </div>
              <div>
                <p className='text-sm text-muted-foreground mb-2'>
                  Server response:
                </p>
                <div className='bg-muted p-3 rounded-md'>
                  <pre className='text-sm'>
                    {buttonResponse || "Click button to see response"}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='grid gap-6 md:grid-cols-2'>
          {/* Table Data Card */}
          <Card>
            <CardHeader>
              <CardTitle>Table Data ({numRows} rows)</CardTitle>
            </CardHeader>
            <CardContent>
              {tableData && numRows > 0 ? (
                <div className='overflow-x-auto max-h-64 overflow-y-auto'>
                  <table className='w-full border-collapse'>
                    <thead className='sticky top-0 bg-background'>
                      <tr className='border-b'>
                        {columnNames.map((colName) => (
                          <th
                            key={colName}
                            className='text-left p-2 font-medium'
                          >
                            {colName}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from(
                        { length: numRows },
                        (_, rowIndex) => (
                          <tr key={rowIndex} className='border-b'>
                            {columnNames.map((colName) => {
                              const value = tableData[colName][rowIndex];
                              return (
                                <td key={colName} className='p-2 text-sm'>
                                  {typeof value === "number"
                                    ? Number.isInteger(value)
                                      ? value
                                      : value.toFixed(2)
                                    : value}
                                </td>
                              );
                            })}
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className='text-center text-muted-foreground'>
                  Loading table data...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Plot Card */}
          <Card>
            <CardHeader>
              <CardTitle>Plot Output</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex justify-center'>
                <ImageOutput id='plot1' className='max-w-full h-auto' />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
