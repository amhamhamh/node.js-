var http = require('http'); //모듈들... 
var fs = require('fs');     // 파일 읽는 시스템을 읽는 것들
var url = require('url');   
var qs = require('querystring');
var template = require('./lib/template.js');   //반복적으로 쓰이는 것을 모듈화 함
var path = require('path'); // 입력정보 세탁을 위해. 읽어 들어 오는 곳에 기입 fs.readifle delete 부분에         
var sanitizeHtml = require('sanitize-html');  // html을 세탁해주는 것을 의미함
 
var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;      //해당 데이터 url을 가져오는 query 데이터 변수(전역변수)
    var pathname = url.parse(_url, true).pathname;    //해당 데이터의 경로를 가져오는 pathname
    if(pathname === '/'){                             //만약 해당 경로가 홈이라면 
      if(queryData.id === undefined){                 //만약 querydata id 값이 undefined면  (if 문)
        fs.readdir('./data', function(error, filelist){   // 아래의 파일 경로를 실행한다. 
          var title = 'Welcome';                          // title 변수는 welcome
          var description = 'Hello, Node.js';             // description 변수는 hello node js를 얘기한다. 
          var list = template.list(filelist);             // template 모듈을 이용하며 list 메소드는 매개변수를 filelist를 쓴다.   
          var html = template.HTML(title, list,           // template 모듈을 이용하며 html 메소드를 매개변수는 title, list, 전역변수 title, description을 가진다.
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>`
          );
          response.writeHead(200);                       // 해당 파일을 읽고 완성이 되며, writehead에 200을 표시하고,
          response.end(html);                            // 끝에 html로 끝을 낸다. 
        });   
      } else {                                              //(else)문
        fs.readdir('./data', function(error, filelist){     //해당 fs 모듈을 사용하며, 콜백함수를 가진다. 
          var filteredId = path.parse(queryData.id).base;   //filtered ID를 변수를 가지며 (html을 세탁함)         
          fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){   // 파일을 읽으며, utf8로 읽음
            var title = queryData.id;                                             // body 본문 부분
            var sanitizedTitle = sanitizeHtml(title);                             // title을 html을 세탁함. 
            var sanitizedDescription = sanitizeHtml(description, {                // decription 부분도 세탁함. decription을 매개변수로 가지고, h1만 제외함.     
              allowedTags:['h1']
            });
            var list = template.list(filelist);                                   // list 부분(위쪽의 list 부분)
            var html = template.HTML(title, list,                                 // HTML 부분.
              `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,                // 변수 sanitizedtitle을 sanitizedDescription을 씀. 
              ` <a href="/create">create</a>
                <a href="/update?id=${sanitizedTitle}">update</a>
                <form action="delete_process" method="post">
                  <input type="hidden" name="id" value="${sanitizedTitle}">
                  <input type="submit" value="delete">
                </form>`
            );
            response.writeHead(200);                                             // 응답하고 html을 답하고. 
            response.end(html);
          });
        });
      }
    } else if(pathname === '/create'){                                      //path name 이거 일 떄,   
      fs.readdir('./data', function(error, filelist){                      // 이렇게 읽어라.        
        var title = 'WEB - create'; 
        var list = template.list(filelist);
        var html = template.HTML(title, list, `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
        `, '');
        response.writeHead(200);                                            // 기본   
        response.end(html);
      }); 
    } else if(pathname === '/create_process'){                             // 만약 위에게 실행이 안되면 create process를 실행.(생성하는 함수)
      var body = '';                                                      // 빈 body 값을 가짐. 
      request.on('data', function(data){                                  
          body = body + data;
      });
      request.on('end', function(){                                     // end와 콜백      
          var post = qs.parse(body);                                    // 어떠한 body 값을 분석하는 코드(추리)          
          var title = post.title;                                      // title을 가짐.       
          var description = post.description;                          // 
          fs.writeFile(`data/${title}`, description, 'utf8', function(err){  // 파일을 쓰는 코드
            response.writeHead(302, {Location: `/?id=${title}`});            // 
            response.end();
          })
      });
    } else if(pathname === '/update'){                                        // 수정할 내용을 입력하는 코드 
      fs.readdir('./data', function(error, filelist){
        var filteredId = path.parse(queryData.id).base;                      // 읽는 코드에 베이스      
        fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){     // 파일을 읽는 코드
          var title = queryData.id;                                             // title
          var list = template.list(filelist);                                   //변수 list
          var html = template.HTML(title, list,                                 //변수 html    
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <p><input type="text" name="title" placeholder="title" value="${title}"></p>
              <p>
                <textarea name="description" placeholder="description">${description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
            `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
          );
          response.writeHead(200);
          response.end(html);
        });
      });
    } else if(pathname === '/update_process'){                       //update 프로세스 입력. 
      var body = '';                                          
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){                                
          var post = qs.parse(body);
          var id = post.id;
          var title = post.title;
          var description = post.description;
          fs.rename(`data/${id}`, `data/${title}`, function(error){                   //파일을 다시 쓰는 함수
            fs.writeFile(`data/${title}`, description, 'utf8', function(err){
              response.writeHead(302, {Location: `/?id=${title}`});                   // 해당 title로 다시 불러내는 함수. 
              response.end();
            })
          });
      });
    } else if(pathname === '/delete_process'){                                        // delet 함수 
      var body = '';                                                                        
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);                                                  
          var id = post.id;
          var filteredId = path.parse(id).base;                                      // data 함수.      
          fs.unlink(`data/${filteredId}`, function(error){                           // 파일을 삭제하는 함수.  
            response.writeHead(302, {Location: `/`});                                // 끝
            response.end();
          })
      });
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
