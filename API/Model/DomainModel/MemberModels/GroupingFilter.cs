namespace Model.DomainModel.MemberModels
{
    public class GroupingFilter
    {
        public string Field { get; set; } = string.Empty;
        public List<string> Ids { get; set; } = new();
    }
    public class GroupedNode
    {
        public string Id { get; set; } = string.Empty;
        public int Count { get; set; }
        public List<GroupedNode>? Children { get; set; }
    }

    // Perplexity

    public class GroupedFieldResult
    {
        public string Field { get; set; }
        public List<IdCountPair> Ids { get; set; } = new();
    }

    public class IdCountPair
    {
        public string Id { get; set; }
        public int Count { get; set; }
    }

    public class Node
    {
        public string Id { get; set; }
        public int Count { get; set; }
        public List<Node> Children { get; set; } = new List<Node>();
    }

    public class HierarchyField
    {
        public string Field { get; set; }
        public List<string> Ids { get; set; } = new();
    }

}
