import { parse } from 'csv-parse'
import fs from 'node:fs'


const csvPath = new URL('./tasks.csv', import.meta.url)

const stream = fs.createReadStream(csvPath)

const csvParse = parse({
  delimiter: ',',
  skip_empty_lines: true,
  fromLine: 2,
})

async function csvToDb() {
  const linesParse = stream.pipe(csvParse)

  for await (const line of linesParse){
   const [title, description] = line

   fetch('http://localhost:3080/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title, description })
   })

   console.log(line)
   await wait(2000)
  }
  
  
  
}


function wait(ms){
  return new Promise((resolve) => setTimeout(resolve, ms)
  )
}
csvToDb()