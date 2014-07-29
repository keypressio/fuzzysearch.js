$(document).ready(function(){
    var characters = [];
    
    // Build the haystack. There's no way I'm typing that out twice.
    // Also, add data for easy access later. Again, to avoid typing.
    $('div.demo div').each(function(){
        var $this = $(this),
            name = $this.find('.name').html();
        
        $this.data({name: name});
        characters.push(name);
    });
    
    // Listen for typing in the demo input
    $('input.demo').on('keyup', function(ev){
        var query = $(this).val(),
            querySplit,
            results;
            
        if (!query) {
            $('div.demo div').each(function(){
                var name = $(this).data('name');
                $(this).find('.name').html(name);
            });
            
            $('div.demo .score').html('');
            
            $('div.demo div').show();
            
            return;
        }
            
        results = FuzzySearch(query, characters);

        // Hide or show spans as needed
        $('div.demo div').each(function(){
            var $this = $(this),
                name = $this.data('name'),
                match;

            if ($this.hasClass('noresults')) {
                return;
            }
                
            match = _.find(results, function(obj){
                return obj.item == name;
            })

            if (match) {
                $this.show();

                if (match.score > 0) {                
                    $this.find('span.score').html(match.score);
                }

                // Highlight matching characters
                name = name.split('').reverse();
                querySplit = query.split('').reverse();

                _.each(name, function(letter, i){
                    if (_.isEmpty(querySplit)) {
                        return;
                    }
                    
                    if (letter.toLowerCase() == querySplit[0].toLowerCase()) {
                        name[i] = '<strong>' + letter + '</strong>';
                        querySplit.shift();
    				}
    			});

                name = name.reverse().join('');
                
                $this.find('.name').html(name);
            } else {
                $this.hide();
            }
        });
        
        if ($('div.demo div:not(.noresults)').filter(':visible').length === 0) {
            $('div.demo div.noresults').show();
        } else {
            $('div.demo div.noresults').hide();
        }
    })
});