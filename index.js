const http = require('http');
const fs = require('fs'); 
const axios = require('axios');
const _ = require('lodash');
const cheerio = require('cheerio'); 
const cors = require('cors'); 
const express = require('express'); 
const app = express(); 


app.use(express.json())
app.use(cors())

const PORT = process.env.port || 3001; 

app.listen(PORT, 
    console.log(`App listening on ${PORT}`)    
)


// function that will write out my scraped data. 
function writeMyFile(myObject, fileName) {
    fs.writeFileSync(`./data/scraped-data/${fileName}.json`, JSON.stringify(myObject));
    console.log('File Complete');
};

const stats2022URL = axios.get('https://www.espn.com/nba/stats/player?limit=300');
const stats2021URL = axios.get('https://www.espn.com/nba/stats/player/_/season/2021/seasontype/2?limit=1000');

axios.all([stats2022URL, stats2021URL]).then(axios.spread((...responses) =>{

    let $22 = cheerio.load(responses[0].data); 
    let $21 = cheerio.load(responses[1].data); 


    let playerNameArray22 = []; 

    // scraping the index, names, and team abbreviations; 
    $22('#fittPageContainer > div:nth-child(4) > div > div > section > div > div:nth-child(3) > div.ResponsiveTable.ResponsiveTable--fixed-left.mt4.Table2__title--remove-capitalization > div > table > tbody > tr > td > div')
    .each((index, element) => {
        
        let playerObj = {index: 0, name: '', teamAbbreviation: ''};
        // #fittPageContainer > div:nth-child(4) > div > div > section > div > div:nth-child(3) > div > div > div > div.Table__Scroller > table > tbody > tr:nth-child(1) > td.position.Table__TD > div

        // index value
        playerObj.index = index; 

        // player name 
        playerObj.name = $22(element).find('a').text();

        playerObj.teamAbbreviation = $22(element).find('span').text(); 
        playerNameArray22.push(playerObj);
    })

    let playerStatsArray22 = []; 

    // #fittPageContainer > div:nth-child(4) > div > div > section > div > div:nth-child(3) > div > div > div > div.Table__Scroller > table > tbody > tr:nth-child(1)
    $22('#fittPageContainer > div:nth-child(4) > div > div > section > div > div:nth-child(3) > div > div > div > div.Table__Scroller > table > tbody > tr')
    .each((index, element) => {

        let playerStats = {
            index: index, 
            position: '',
            gamesPlayed: '',
            minutes: '',
            avgPointPerGame:'',
            fieldGoalsMade: '',
            fieldGoalsAttempted:'',
            fieldGoalPercentage: '',
            threePointersMade: '',
            threePointersAtt:'',
            threePointPercentage:'',
            freeThrowsMade:'',
            freeThrowsAttempted:'',
            freeThrowPercentage:'',
            rebounds:'',
            assist:'',
            steals:'',
            blocks:'',
            turnovers:'',
            doubleDouble:'',
            tripleDouble:'',
            playerEfficiencyRating:''
        }

        // setting a variable equal to the table data cell element with the class of Table__TD in the HTML Table; 
        let td = $22(element).find('td.Table__TD')
        // the eq() method will reduce the set of match elements to the one at the specified index; 
        playerStats.position = $22(td).eq(0).text(); 
        playerStats.gamesPlayed = $22(td).eq(1).text(); 
        playerStats.minutes = $22(td).eq(2).text(); 
        playerStats.avgPointPerGame = $22(td).eq(3).text(); 
        playerStats.fieldGoalsMade = $22(td).eq(4).text(); 
        playerStats.fieldGoalsAttempted = $22(td).eq(5).text(); 
        playerStats.fieldGoalPercentage = $22(td).eq(6).text(); 
        playerStats.threePointersMade = $22(td).eq(7).text(); 
        playerStats.threePointersAtt = $22(td).eq(8).text(); 
        playerStats.threePointPercentage = $22(td).eq(9).text(); 
        playerStats.freeThrowsMade = $22(td).eq(10).text(); 
        playerStats.freeThrowsAttempted = $22(td).eq(11).text(); 
        playerStats.freeThrowPercentage = $22(td).eq(12).text(); 
        playerStats.rebounds = $22(td).eq(13).text(); 
        playerStats.assist = $22(td).eq(14).text(); 
        playerStats.assist = $22(td).eq(15).text(); 
        playerStats.blocks = $22(td).eq(16).text(); 
        playerStats.turnovers = $22(td).eq(17).text(); 
        playerStats.doubleDouble = $22(td).eq(18).text(); 
        playerStats.tripleDouble = $22(td).eq(19).text(); 
        playerStats.playerEfficiencyRating = $22(td).eq(20).text(); 

        playerStatsArray22.push(playerStats)
    }); 

    // console.log(playerStatsArray22)

    let final22RegSeasonObj = _.map(playerNameArray22, playerName => {
        return _.extend(playerName, _.find(playerStatsArray22,{index: playerName.index} ))
    })
    // console.log(final22RegSeasonObj)
}))
.catch(err => {
    console.error(err); 
})





// Salaries
let currentSalaryPage =1; 
const limit = 12; 


const salary2022URL = 'http://www.espn.com/nba/salaries/_/page/'; 


let salaryArray22 = []; 

for(let i =1 ; i <= limit; i ++){

    console.log(`${salary2022URL}${i}`)

    axios.get(`${salary2022URL}${i}`)    
    .then(response => {

        $salary = cheerio.load(response.data);
        
        
        $salary('#my-players-table > div > div.mod-content > table > tbody > tr').each((index, element)=> {
        
        
        let salaries2022 = {}; 
        

        salaries2022.index = index
        salaries2022.name = $salary(element.childNodes[1]).text()
        console.log($salary(element.childNodes[1]).text())
        salaries2022.team = $salary(element.childNodes[2]).text()
        salaries2022.salary = $salary(element.childNodes[3]).text()
        salaries2022.year = '2022'

        salaryArray22.push(salaries2022)
    })
    
    // console.log(salaryArray22)
    
    myFinalObject=[...salaryArray22]
    writeMyFile(salaryArray22, `NBA-Salary-Data${i}`)
            
    })
}









