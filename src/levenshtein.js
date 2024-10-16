export const levenshteinDistance= (text1,text2)=>{
    const track= Array(text2.length+1).fill(null).map(() =>
    Array(text1+1).fill(null));
    for(let i =0; i<= text1.length; i+=1)
    {
        track[0][i] = i;
    }
    for(let j =0;j<= text2.length; j+=1)
    {
        track[j][0] = j;
    }
    for(let j=1; j<= text2.length; j+=1)
    {
        for(let i= 1; i<= text1.length; i+=1)
        {
            const indicator = text1[i-1] === text2[j-1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1]+1,
                track[j-1][i] + 1,
                track[j-1][i-1] + indicator,
            );
        }
    }
    return track[text2.length][text1.length];
};
