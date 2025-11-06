const mod =251;

function modInverse(a, m) {
    a = ((a % m) + m) % m;
    //if (a === 0) return a;
    for (let x = 1; x < m; x++) {
        if ((a * x) % m === 1) {
            return x;
        }
    }
    throw new Error(`Modular inverse does not exist for ${a} mod ${m}`);
}

export function encodeWithSSS(number){
    const Codes=[]


    if (number >250) {
        number = 250;
    }


    
    function createF(number,x){
        return ((number+166*x+94*x*x) %mod);
    }

    for (let i=1;i<=6;i++){
        Codes.push(i,createF(number,i));
    }

    //console.log("Codes: ", Codes);
    return Codes;
}

export function decodeWithSSS(Codes){

    function createPolinom(x, y, z) {
        const lagrangePolynomial = [];
        const denom = modInverse((x - y) * (x - z), mod);
        
        lagrangePolynomial.push((denom) % mod);
        lagrangePolynomial.push(((-y*denom)+(-z*denom)) % mod);
        lagrangePolynomial.push(((-y * -z) * denom) % mod);
        return lagrangePolynomial;
    }
    const l0=createPolinom(Codes[0][0],Codes[1][0],Codes[2][0]);
    const l1=createPolinom(Codes[1][0],Codes[0][0],Codes[2][0]);
    const l2=createPolinom(Codes[2][0],Codes[0][0],Codes[1][0]);

    const sum=[];
    for(let i=0;i<Codes[0][1].length;i++){
        //sum.push((l0[0] * Codes[0][1] + l1[0] * Codes[2][1] + l2[0] * Codes[4][1]) % mod);
        //sum.push((l0[1] * Codes[0][1] + l1[1] * Codes[2][1] + l2[1] * Codes[4][1]) % mod);
        sum.push((l0[2] * Codes[0][1][i] + l1[2] * Codes[1][1][i] + l2[2] * Codes[2][1][i]) % mod);
    }
    //const normalized = sum.map(c => ((c % mod) + mod) % mod);
    //console.log("normalized: ", normalized);

    return sum;
}