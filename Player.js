class Player{
    constructor(ParentPlayer)
    {
        this.fitness = 0;
        this.default_depth = 7;
    }
    
    board_evaluation_NN(board)
    {
        let output = this.brain.feedforward(board.board_array);
        return output*10;
    }

    mutate(rate)
    {

    }

    make_move_minMax(playerType,board, depth, expectedDepth, al, be)
    {
        var max = -Infinity
        var min = Infinity
        var output = -1*Infinity*playerType;
        var index;
        var available_column;
        for(let j=0, direction=1, i=3;j<board.size;j++, direction*=-1, i = i + direction*j)
        {
            var score;
            if(board.put_pin(playerType,i)==true)
            {
                available_column = i;
                if(this.is_winning_move(board, i)==true)
                {
                    // print_board(board)
                    // console.log('depth',depth,'move',i,'score',Infinity*playerType);
                    board.remove_pin(i);
                    index = i;
                    output = Infinity*playerType;
                    break;
                }
                if(depth<expectedDepth || (board.available_columns>0 && board.available_columns<4))
                {
                    score = this.make_move_minMax(playerType*-1,board,depth+1,expectedDepth,al,be);
                }
                else{
                    score = this.board_evaluation(board);
                }
                // print_board(board)
                // console.log('depth',depth,'move',i,'score',score);
                board.remove_pin(i);
                if(score == playerType*Infinity)
                {
                    output = score;
                    index = i;
                    break;
                }
                if(playerType>0)
                {
                    al = Math.max(al,score);
                    if(score>max)
                    {
                        max = score;
                        output = score;
                        index = i;
                    }
                }
                else if(playerType<0)
                {
                    be = Math.min(be,score);
                    if(score<min){
                        min = score;
                        output = score;
                        index = i;
                    }
                }
                // console.log('alpha',al,'beta',be)
                if(al>=be)
                   { 
                    //    console.log('pruned here');
                       break;}
            }
        }
        if(depth==1)
        {
            index = index===undefined?available_column:index;
            return [index,output];
        }
        return output;
    } 

    is_winning_move(board, column)
    {
        // check winning move along all the diagonals around the move
        switch(true){
            case this.check_connections(board, column, 1, 1): 
                return true;
            case this.check_connections(board, column, 1,0):
                return true
            case this.check_connections(board, column, -1, 1):
                return true; 
            case this.check_connections(board, column, 0, 1):
                return true;
        }
        return false;
    }

    check_connections(board, column, increment_row, increment_col)
    {
        // checks connections 4 move to left or right
        var row = board.height_of_column[column]-1;
        var outer_row_limit = row + increment_row*(board.connect-1);
        var outer_col_limit = column + increment_col*(board.connect-1);
        var type = board.get_pin_at(row,column);
        for(let i=0;i<board.connect;i++)
        {
            var player_pins = 0;
            var next_row = outer_row_limit;
            var next_col = outer_col_limit;
            for(let j=0;j<board.connect;j++)
            {
                if(next_row>=0 && next_row<board.size_vertical
                    && next_col>=0 && next_col<board.size)
                {
                    var this_pin = board.get_pin_at(next_row,next_col);
                    if(this_pin==type)
                    {
                        player_pins +=1;
                        if(player_pins==board.connect)
                        {
                            return true;
                        }
                    }
                }
                else{
                    break;
                }
                next_row-=increment_row;
                next_col-=increment_col;
            }
            outer_row_limit-=increment_row;
            outer_col_limit-=increment_col;
        }
        return false;
    }

    board_evaluation(board)
    {
        var score =0;
        for(let i =0;i<board.size ;i++)
        {
            var left = i-1;
            var right = i+1;
            var row = board.height_of_column[i];
            while(
                row>0 && row<board.size_vertical &&
                    ((left>=0 && board.get_pin_at(row,left)!=0)
                ||  (right<board.size && board.get_pin_at(row,right)!=0)
                ||  (right<board.size && board.get_pin_at(row-1,right)!=0)
                ||  (left>=0 && board.get_pin_at(row-1,left)!=0)
                ||  (board.get_pin_at(row-1,i)!=0))
            )
            {
                score += this.check_linear_evaluation(board, row, i, 0, 1);
                score += this.check_linear_evaluation(board, row, i, 1, 0);
                score += this.check_linear_evaluation(board, row, i, 1, 1);
                score += this.check_linear_evaluation(board, row, i, -1, 1);
                row+=1;
            }
        }
        return score;
    }

    check_linear_evaluation(board, row, column, increment_row, increment_col)
    {
        var outer_row_limit = row + increment_row*(board.connect-1);
        var outer_col_limit = column + increment_col*(board.connect-1);
        var score =0;
        for(let i=0;i<board.connect;i++)
        {
            var pinA = 0;
            var pinB = 0;
            var next_row = outer_row_limit;
            var next_col = outer_col_limit;
            for(let j=0;j<board.connect;j++)
            {
                if(next_row>=0 && next_row<board.size_vertical
                    && next_col>=0 && next_col<board.size)
                {
                    var this_pin = board.get_pin_at(next_row,next_col);
                    if(this_pin==1)
                    {
                        pinA +=this_pin;
                    }
                    if(this_pin==-1)
                    {
                        pinB +=this_pin;
                    }
                }
                else{
                    pinA = 0;
                    pinB = 0;
                    break;
                }
                next_row-=increment_row;
                next_col-=increment_col;
            }
            if(pinA==0 || pinB==0)
            {
                score += pinA + pinB;
            }
            else if(pinB>1)
            {
                score -= pinB;
            }
            else if(pinA>1)
            {   
                score -= pinA;
            }
            outer_row_limit-=increment_row;
            outer_col_limit-=increment_col;
        }
        return score;
    }
}