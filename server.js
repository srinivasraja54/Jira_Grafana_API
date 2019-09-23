const request = require("request")
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const morgan = require('morgan')
const passport = require('passport')
const BasicStrategy = require('passport-http').BasicStrategy
const AnonymousStrategy = require('passport-anonymous')      

 
var jirahost = process.env.JIRA_HOST
var username1 = process.env.JIRA_USER
var password1 = process.env.JIRA_PASS

app.use(bodyParser.json())
app.use(morgan('combined'))
app.use(passport.initialize())

let authenticationStrategy = null
if (process.env.HTTP_USER) {
  passport.use(new BasicStrategy(
    function (username, password, done) {

        if (username1 == username &&
          password1 == password) {
          return done(null, true)
        }

      return done(null, false)
    }
  ))

  authenticationStrategy = 'basic'
}
else {
  // Default ot allowing anonymous access
  passport.use(new AnonymousStrategy())
  authenticationStrategy = 'anonymous'
}

getOutput = (arg_url) => {
  return new Promise((resolve, reject) => {
    request({
      url: arg_url,
      auth: {
        user: username1,
        password: password1
      },
      rejectUnauthorized: false
    }, function(error,response,body){
      if(!error)
      var content = JSON.parse(body)
      resolve(content)
    })
  }
)
}

app.get('/',
passport.authenticate(authenticationStrategy, { session: false }),
  (httpReq, httpRes) => {
    httpRes.set('Content-Type', 'text/plain')
    httpRes.send(new Date() + ': OK')
})
url1 = 'http://'+jirahost+'/rest/api/2/filter/favourite'
app.all('/search',
//passport.authenticate(authenticationStrategy, { session: false }),
(httpReq, httpRes) => {
    getOutput(url1).then(content => {
      let result = content.map(filter => {
      return{
      text: filter.id,
      value: filter.name
    }
    })
    httpRes.json(result)
})
})



app.post('/query', 
  //passport.authenticate(authenticationStrategy, { session: false }),
  (httpReq, httpRes) => {
  
  let result = []
  let from = new Date(httpReq.body.range.from).toISOString().replace(/T/, ' ').replace([/-/], '/').replace(/\:([^:]*)$/, '').replace(/-/g, '/')
  let to = new Date(httpReq.body.range.to).toISOString().replace(/T/, ' ').replace(/-/, '/').replace(/\:([^:]*)$/, '').replace(/-/g, '/')
  
  let p = httpReq.body.targets.map(target => {

    // Default jql with time range
    let jql = [`created >= "${from}"`, `created <= "${to}"`]
    if ( target.target ) {
      jql.push(`filter = "${target.target}"`)
    }
    query=jql.join(' AND ')
    var url2 = 'http://'+jirahost+'/rest/api/2/search?jql='+query+'&maxResults=-1'
    var url2 = url2.split(' ').join('+')
    try {
    getOutput(url2).then(body => {
        if (target.type == 'timeserie') {
        let datapoints = body.issues.map(issue => {
          timestamp = Math.floor(new Date(issue.fields.created))
          return [1, timestamp]
        })
        result.push({
          target: target.target,
          datapoints: datapoints
        })
      }
      else if (target.type == 'table') {
        let rows = body.issues.map(issue => {
          return [
            issue.key,
            issue.fields.summary,
            issue.fields.assignee ? issue.fields.assignee.displayName : '',
            issue.fields.status ? issue.fields.status.name : '',
            issue.fields.created
          ]
        })
        result.push({
          columns: [
            { text: 'Key', 'type': 'string' },
            { text: 'Summary', 'type': 'string' },
            { text: 'Assignee', 'type': 'string' },
            { text: 'Status', 'type': 'string' },
            { text: 'Created', 'type': 'time' }
          ],
          type: 'table',
          rows: rows
        })
      }
        return httpRes.json(result)
   
  } 
).catch(e => console.error(`Warning Ingorable : ${e})`));
}catch(error) {
  return httpRes.json(error.message);
}
  })
})

app.listen(3000)


console.log('Server is listening to port 3000')