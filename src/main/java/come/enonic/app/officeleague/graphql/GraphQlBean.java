package come.enonic.app.officeleague.graphql;

import java.util.Map;

import graphql.GraphQL;
import graphql.Scalars;
import graphql.schema.GraphQLFieldDefinition;
import graphql.schema.GraphQLObjectType;
import graphql.schema.GraphQLSchema;

public class GraphQlBean
{

    public static void main( String[] args )
    {

        GraphQLObjectType queryType = GraphQLObjectType.newObject().name( "helloWorldQuery" ).field(
            GraphQLFieldDefinition.newFieldDefinition().type( Scalars.GraphQLString ).name( "hello" ).staticValue(
                "Hello world!" ) ).build();

        GraphQLSchema schema = GraphQLSchema.newSchema().query( queryType ).build();
        GraphQL graphQL = new GraphQL( schema );
        Map<String, Object> result = (Map<String, Object>) graphQL.execute( "{hello}" ).getData();

        System.out.println( result );
    }
}
