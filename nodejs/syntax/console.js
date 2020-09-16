var args = process.argv; // process.argv는 parameter 값을 뱉는 값임

console.log(args[2]);    
console.log('A');
console.log('B');
if(args[2] === '1'){ 
  console.log('C1');
} else {
  console.log('C2');
}
console.log('D');

args=process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});
// 전부 배열 형태임
// argv의 '0'번째 첫번째 배열 값은 0: C:\Program Files\nodejs\node.exe (node 프로그램이 작동하는 위치)
//1: C:\Users\amham\OneDrive\바탕 화면\nodejs\syntax\console.js (그리고 실행하는 파일이 해당하는 위치)
// node console.js 1 2 3 입력을 하면 (cmd에서 이렇게 실행을 하면)
//0: C:\Program Files\nodejs\node.exe
//1: C:\Users\amham\OneDrive\바탕 화면\nodejs\syntax\console.js
//2: 1
//3: 2
//4: 3