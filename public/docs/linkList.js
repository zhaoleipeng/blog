const heads = {
  val: 1,
  next: {
    val: 2,
    next: {
      val: 3,
      next: {
        val: 4,
        next: {
          val: 5,
          next: null
        }
      }
    }
  }
}

function reveseLink(linkList) {
  let pre = null
  let cur = linkList
  while (cur != null) {
    let temp = cur.next
    cur.next = pre
    console.log(1, cur)
    console.log(1.5, pre)
    pre = cur
    console.log(2, pre)
    cur = temp
    console.log(3, cur)
  }
  return pre
}

console.log(reveseLink(heads))