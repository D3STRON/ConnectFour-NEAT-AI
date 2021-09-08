class Player{
    constructor(ParentPlayer)
    {
        if(ParentPlayer instanceof Player)
        {   
            this.gap_point = ParentPlayer.gap_point;
            this.pin_point = ParentPlayer.pin_point;
            this.center_point = ParentPlayer.center_point;
            this.pin_point_opponent = ParentPlayer.pin_point_opponent;
        }
        else{
            //these evaluation point were brewed by genetic algo
            //you can start with random values and reach these results
            this.gap_point = 0.29530133623980565;
            this.pin_point = 4.698781152240304;
            this.center_point = 14.87158015030069;
            this.pin_point_opponent = 6.557380245307205;
        }
        this.fitness = 0;
        this.default_depth = 6;
    }
    
    make_move_NN(board)
    {
        let output = this.brain.feedforward(board.board_array);
        let max = -Infinity;
        let max_index = 0;
        for(let i =0;i<board.size;i++){
            if(board.height_of_column[i]<board.size && output.get(i,0)>max){
                
                max = output.get(i,0);
                max_index = i;
            }
        }
        return max_index;
    }

    mutate(rate)
    {

        if(Math.random()<rate)
        {
            this.gap_point += randomGaussian(0, 0.1)
            console.log(this.gap_point)
        }
        if(Math.random()<rate)
        {
            this.pin_point += randomGaussian(0, 1)
            console.log(this.pin_point)
        }
        if(Math.random()<rate)
        {
            this.center_point += randomGaussian(0, 1)
            console.log(this.center_point)
        }
        if(Math.random()<rate)
        {
            this.pin_point_opponent += randomGaussian(0, 1)
            console.log(this.pin_point_opponent)
        }
    }

    make_move_minMax(playerType,board, depth, expectedDepth)
    {
        var max = -Infinity
        var min = Infinity
        var output = 0;
        for(let i=0;i<board.size;i++)
        {
            var score = 0;
            score += this.evaluate_move(playerType,board,i);
            if(score == playerType*Infinity)
            {
                board.remove_pin(i);
                if(depth==1)
                {
                    return [i,'won'];
                }
                return score;
            }
            else if(score != -1*playerType*Infinity){
                
                if(depth+1<=expectedDepth)
                {
                    score += this.make_move_minMax(playerType*-1,board, depth+1, expectedDepth)
                }
                board.remove_pin(i);
                if(playerType>0 && score>=max)
                {
                    max = score;
                    output = score;
                    if(depth ==1)
                    {
                        output = i;
                    }
                }
                else if(playerType<0 && score<=min){
                    min = score;
                    output = score;
                    if(depth ==1)
                    {
                        output = i;
                    }
                }
            }
        }
        return output;
    } 

    evaluate_move(playerType, board, column)
    {
        if(board.put_pin(playerType,column)==false){

            return -1*playerType*Infinity;
        }
        //the closer to the center the more the score it gets
        //lesser the (chosen_column- Center_column) lesser will be the score divisor
        //hence more will be score
        var score_divisor = (Math.abs(Math.floor(board.size/2)-column)+1)
        var score = Math.floor(this.center_point/score_divisor);
        // check socre in horizontal vertical and diagonal directions
        score += this.check_move_score(board, column, 1, 1) 
                + this.check_move_score(board, column, 1,0)
                + this.check_move_score(board, column, -1, 1) 
                + this.check_move_score(board, column, 0, 1);
        return score*playerType;
    }

    check_move_score(board, column, increment_row, increment_col)
    {
        var row = board.height_of_column[column]-1;
        var outer_row_limit = row + increment_row*(board.connect-1);
        var outer_col_limit = column + increment_col*(board.connect-1);
        var type = board.get_pin_at(row,column);
        var score = 0;
        for(let i=0;i<board.connect;i++)
        { 
            var gaps = 0;
            var opponent_pins = 0;
            var player_pins = 0;
            var next_row = outer_row_limit;
            var next_col = outer_col_limit;
            var sample_array=[];
            for(let j=0;j<board.connect;j++)
            {
                if(next_row>=0 && next_row<board.size 
                    && next_col>=0 && next_col<board.size)
                {
                    var this_pin = board.get_pin_at(next_row,next_col);
                    if(this_pin==type)
                    {
                        player_pins +=1;
                        if(player_pins==board.connect)
                        {
                            return Infinity;
                        }
                    }
                    else if(this_pin==0)
                    {
                        gaps+=1;
                    }
                    else{
                        opponent_pins+=1;
                    }
                    // sample_array.push(this_pin)
                }
                else{
                    break;
                }
                next_row-=increment_row;
                next_col-=increment_col;
            }
            if(player_pins+gaps==board.connect)
            {
                score += player_pins*this.pin_point + gaps*this.gap_point;
            }
            else if(player_pins==1)
            {
                score += opponent_pins*this.pin_point_opponent;
            }
            // console.log(sample_array,gaps,player_pins,opponent_pins);
            outer_row_limit-=increment_row;
            outer_col_limit-=increment_col;
        }
        return score;
    }
}