import axios from 'axios'

export default (req, res) => {
  const { session, id } = req.query

  axios
    .get(`https://www.myfxbook.com/api/get-open-trades.json?session=${session}&id=${id}`)
    .then(response => res.status(200).json(response.data))
    .catch(function(error) {
      // handle error
      console.log(error)
    })
}
